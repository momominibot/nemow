// ppg.js — Camera Finger PPG Engine for Ovuluna
// Client-side signal processing: detrending, peak detection, BPM, HRV (RMSSD)
// No external dependencies, fully Vercel-compatible static client asset.

(function () {
  'use strict';

  // ============================================================
  // PPG Signal Processor
  // ============================================================
  class PPGProcessor {
    constructor(options = {}) {
      this.samplingRate = options.samplingRate || 30; // FPS
      this.minPeakInterval = options.minPeakInterval || 400; // ms (max 150 BPM)
      this.movingAverageWindow = options.movingAverageWindow || 15; // samples for detrending
      this.smoothingWindow = options.smoothingWindow || 5; // samples for smoothing
    }

    /**
     * Detrend signal using moving average baseline subtraction.
     * Removes slow drift from hand movement / variable finger pressure.
     */
    detrend(signal) {
      if (signal.length < this.movingAverageWindow) return signal.slice();
      
      const result = new Float64Array(signal.length);
      const halfWin = Math.floor(this.movingAverageWindow / 2);
      
      for (let i = 0; i < signal.length; i++) {
        let sum = 0;
        let count = 0;
        for (let j = Math.max(0, i - halfWin); j <= Math.min(signal.length - 1, i + halfWin); j++) {
          sum += signal[j];
          count++;
        }
        result[i] = signal[i] - (sum / count);
      }
      return result;
    }

    /**
     * Smooth signal using moving average.
     */
    smooth(signal) {
      if (signal.length < this.smoothingWindow) return signal.slice();
      
      const result = new Float64Array(signal.length);
      const halfWin = Math.floor(this.smoothingWindow / 2);
      
      for (let i = 0; i < signal.length; i++) {
        let sum = 0;
        let count = 0;
        for (let j = Math.max(0, i - halfWin); j <= Math.min(signal.length - 1, i + halfWin); j++) {
          sum += signal[j];
          count++;
        }
        result[i] = sum / count;
      }
      return result;
    }

    /**
     * Detect systolic peaks in the filtered signal.
     * Enforces minimum refractory period between peaks.
     * Returns array of peak indices.
     */
    detectPeaks(signal, timestamps) {
      if (signal.length < 10) return [];
      
      const peaks = [];
      const threshold = this.calculateAdaptiveThreshold(signal);
      
      for (let i = 2; i < signal.length - 2; i++) {
        // Local maximum check
        if (signal[i] > threshold &&
            signal[i] > signal[i - 1] &&
            signal[i] > signal[i - 2] &&
            signal[i] >= signal[i + 1] &&
            signal[i] >= signal[i + 2]) {
          
          // Refractory period check
          if (peaks.length > 0) {
            const lastPeakTime = timestamps[peaks[peaks.length - 1]];
            const currentTime = timestamps[i];
            if (currentTime - lastPeakTime < this.minPeakInterval) {
              // Replace if this peak is higher
              if (signal[i] > signal[peaks[peaks.length - 1]]) {
                peaks[peaks.length - 1] = i;
              }
              continue;
            }
          }
          peaks.push(i);
        }
      }
      return peaks;
    }

    /**
     * Calculate adaptive threshold as percentage of signal amplitude.
     */
    calculateAdaptiveThreshold(signal) {
      let max = -Infinity;
      let min = Infinity;
      for (let i = 0; i < signal.length; i++) {
        if (signal[i] > max) max = signal[i];
        if (signal[i] < min) min = signal[i];
      }
      const amplitude = max - min;
      return min + amplitude * 0.35; // 35% of amplitude above min
    }

    /**
     * Calculate BPM from detected peaks and timestamps.
     */
    calculateBPM(peaks, timestamps) {
      if (peaks.length < 2) return 0;
      
      const firstPeakTime = timestamps[peaks[0]];
      const lastPeakTime = timestamps[peaks[peaks.length - 1]];
      const elapsedSeconds = (lastPeakTime - firstPeakTime) / 1000;
      
      if (elapsedSeconds <= 0) return 0;
      
      // BPM = (number of intervals / elapsed seconds) * 60
      const intervals = peaks.length - 1;
      return Math.round((intervals / elapsedSeconds) * 60);
    }

    /**
     * Calculate HRV using RMSSD (Root Mean Square of Successive Differences).
     * Returns value in milliseconds.
     */
    calculateHRV(peaks, timestamps) {
      if (peaks.length < 3) return 0;
      
      const intervals = [];
      for (let i = 1; i < peaks.length; i++) {
        const rrInterval = timestamps[peaks[i]] - timestamps[peaks[i - 1]];
        intervals.push(rrInterval);
      }
      
      if (intervals.length < 2) return 0;
      
      // Calculate successive differences
      let sumSquaredDiffs = 0;
      for (let i = 1; i < intervals.length; i++) {
        const diff = intervals[i] - intervals[i - 1];
        sumSquaredDiffs += diff * diff;
      }
      
      const meanSquaredDiff = sumSquaredDiffs / (intervals.length - 1);
      return Math.round(Math.sqrt(meanSquaredDiff));
    }

    /**
     * Full processing pipeline.
     * Input: array of { time: ms, value: redMean }
     * Output: { bpm, hrv, peaks, filteredSignal, quality }
     */
    process(rawData) {
      if (rawData.length < 30) {
        return { bpm: 0, hrv: 0, peaks: [], filteredSignal: [], quality: 'insufficient' };
      }

      const timestamps = rawData.map(d => d.time);
      const values = new Float64Array(rawData.map(d => d.value));

      // Signal processing pipeline
      const detrended = this.detrend(values);
      const smoothed = this.smooth(detrended);
      const peaks = this.detectPeaks(smoothed, timestamps);
      
      const bpm = this.calculateBPM(peaks, timestamps);
      const hrv = this.calculateHRV(peaks, timestamps);

      // Quality assessment
      let quality = 'good';
      if (peaks.length < 5) quality = 'poor';
      else if (bpm < 40 || bpm > 180) quality = 'unreliable';
      else if (hrv < 5 || hrv > 200) quality = 'uncertain';

      return {
        bpm,
        hrv,
        peaks,
        filteredSignal: Array.from(smoothed),
        quality,
        peakCount: peaks.length,
        duration: (timestamps[timestamps.length - 1] - timestamps[0]) / 1000
      };
    }
  }

  // ============================================================
  // TCM Logic Mapper
  // ============================================================
  class TCMLogicMapper {
    constructor() {
      this.userBaseline = {
        rhr: null,      // resting heart rate baseline
        hrv: null,      // HRV baseline
        phase: null     // current cycle phase
      };
    }

    setBaseline(rhr, hrv, phase) {
      this.userBaseline = { rhr, hrv, phase };
    }

    /**
     * Analyze PPG results and map to TCM diagnostics.
     */
    analyze(results) {
      const { bpm, hrv, quality } = results;
      const advice = [];
      const flags = [];

      if (quality === 'insufficient' || quality === 'poor') {
        return {
          diagnosis: 'insufficient_data',
          advice: ['Measurement quality was low. Please try again with firm finger placement and steady lighting.'],
          flags: ['low_quality']
        };
      }

      // Stress detection: HRV below baseline AND RHR elevated
      if (this.userBaseline.hrv && this.userBaseline.rhr) {
        const hrvDrop = hrv < this.userBaseline.hrv * 0.7;
        const rhrSpike = bpm > this.userBaseline.rhr + 8;
        
        if (hrvDrop && rhrSpike) {
          flags.push('stress_override');
          advice.push(
            'High stress / Liver Qi Stagnation detected. ' +
            'Ovuluna has automatically adjusted your Intermittent Fasting window to a gentle 12 hours max. ' +
            'Prioritize warm, cooked NOVA Group 1 foods today.'
          );
        }
      }

      // Luteal phase verification: sustained RHR elevation
      if (this.userBaseline.phase === 'luteal' && this.userBaseline.rhr) {
        if (bpm > this.userBaseline.rhr + 3) {
          flags.push('luteal_confirmed');
          advice.push(
            'Elevated resting pulse consistent with active Luteal Yang energy. ' +
            'Progesterone requires steady fuel — keep your fasting window capped at 12 hours.'
          );
        }
      }

      // General health guidance
      if (bpm >= 60 && bpm <= 100 && hrv >= 20) {
        advice.push('Heart rate and variability are within healthy ranges. Continue with your current wellness routine.');
      }
      if (bpm < 60) {
        advice.push('Resting heart rate is low — this can indicate good cardiovascular fitness. If you feel dizzy or fatigued, consult a healthcare provider.');
      }
      if (bpm > 100) {
        advice.push('Heart rate is elevated. Consider reducing caffeine, practicing breathwork, and ensuring adequate hydration.');
      }
      if (hrv < 20 && !flags.includes('stress_override')) {
        advice.push('HRV is lower than ideal — prioritize sleep, stress management, and gentle movement. Try the 4-7-8 breathing technique.');
      }

      return {
        diagnosis: flags.length > 0 ? flags.join('+') : 'balanced',
        advice,
        flags,
        bpm,
        hrv
      };
    }
  }

  // ============================================================
  // Camera PPG Controller
  // ============================================================
  class CameraPPG {
    constructor(canvasElement, videoElement, options = {}) {
      this.canvas = canvasElement;
      this.ctx = canvasElement.getContext('2d', { willReadFrequently: true });
      this.video = videoElement;
      this.stream = null;
      this.track = null;
      this.torchSupported = false;
      this.isMeasuring = false;
      this.rawData = [];
      this.processor = new PPGProcessor(options);
      this.tcmMapper = new TCMLogicMapper();
      this.calibrationThreshold = options.calibrationThreshold || 180;
      this.sampleBoxSize = options.sampleBoxSize || 50;
      this.onFrame = options.onFrame || (() => {});
      this.onCalibrationChange = options.onCalibrationChange || (() => {});
      this._animationId = null;
      this._lastSampleTime = 0;
      this._sampleInterval = 1000 / 30; // 30 FPS target
    }

    /**
     * Initialize camera and request permissions.
     */
    async init() {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        });

        this.video.srcObject = this.stream;
        await this.video.play();

        this.track = this.stream.getVideoTracks()[0];
        
        // Check torch support
        const capabilities = this.track.getCapabilities ? this.track.getCapabilities() : {};
        this.torchSupported = !!capabilities.torch;
        
        return { success: true, torchSupported: this.torchSupported };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    /**
     * Turn on torch/flash.
     */
    async enableTorch() {
      if (!this.torchSupported || !this.track) return false;
      try {
        await this.track.applyConstraints({
          advanced: [{ torch: true }]
        });
        return true;
      } catch (err) {
        return false;
      }
    }

    /**
     * Turn off torch/flash.
     */
    async disableTorch() {
      if (!this.torchSupported || !this.track) return false;
      try {
        await this.track.applyConstraints({
          advanced: [{ torch: false }]
        });
        return true;
      } catch (err) {
        return false;
      }
    }

    /**
     * Extract mean red channel value from center sample box.
     */
    extractRedMean() {
      const w = this.video.videoWidth;
      const h = this.video.videoHeight;
      if (!w || !h) return 0;

      const boxSize = Math.min(this.sampleBoxSize, Math.floor(Math.min(w, h) * 0.3));
      const x = Math.floor((w - boxSize) / 2);
      const y = Math.floor((h - boxSize) / 2);

      this.ctx.drawImage(this.video, 0, 0, w, h);
      const imageData = this.ctx.getImageData(x, y, boxSize, boxSize);
      const data = imageData.data;

      let redSum = 0;
      const pixelCount = boxSize * boxSize;
      for (let i = 0; i < data.length; i += 4) {
        redSum += data[i]; // Red channel
      }
      return redSum / pixelCount;
    }

    /**
     * Start calibration loop (checks finger placement).
     */
    startCalibration() {
      this._stopped = false;
      this.isMeasuring = false;
      this.rawData = [];
      let calibratedFrames = 0;
      const requiredFrames = 30; // ~1 second of stable placement

      const loop = () => {
        if (this._stopped) return;
        
        const now = performance.now();
        if (now - this._lastSampleTime >= this._sampleInterval) {
          const redMean = this.extractRedMean();
          const isCalibrated = redMean >= this.calibrationThreshold;
          
          if (isCalibrated) {
            calibratedFrames++;
          } else {
            calibratedFrames = 0;
          }
          
          this.onCalibrationChange(isCalibrated, redMean, calibratedFrames >= requiredFrames);
          this.onFrame(redMean, isCalibrated);
          this._lastSampleTime = now;
        }
        
        this._animationId = requestAnimationFrame(loop);
      };
      loop();
    }

    /**
     * Start 30-second data acquisition.
     */
    startMeasurement(durationSeconds = 30, onProgress) {
      this._stopped = false;
      this.isMeasuring = true;
      this.rawData = [];
      const startTime = performance.now();
      const endTime = startTime + (durationSeconds * 1000);

      const loop = () => {
        if (this._stopped || !this.isMeasuring) return;
        
        const now = performance.now();
        const elapsed = now - startTime;
        
        if (now - this._lastSampleTime >= this._sampleInterval) {
          const redMean = this.extractRedMean();
          this.rawData.push({ time: now, value: redMean });
          this.onFrame(redMean, true);
          this._lastSampleTime = now;
          
          if (onProgress) {
            onProgress(Math.min(100, (elapsed / (durationSeconds * 1000)) * 100), elapsed);
          }
        }
        
        if (now >= endTime) {
          this.stop();
          return;
        }
        
        this._animationId = requestAnimationFrame(loop);
      };
      loop();
    }

    /**
     * Stop measurement and process results.
     */
    stop() {
      this._stopped = true;
      this.isMeasuring = false;
      if (this._animationId) {
        cancelAnimationFrame(this._animationId);
      }
      this.disableTorch();
      
      if (this.rawData.length > 0) {
        return this.processor.process(this.rawData);
      }
      return null;
    }

    /**
     * Release camera resources.
     */
    release() {
      this._stopped = true;
      if (this._animationId) {
        cancelAnimationFrame(this._animationId);
      }
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }
      this.stream = null;
      this.track = null;
    }
  }

  // Export to global scope
  window.OvulunaPPG = {
    PPGProcessor,
    TCMLogicMapper,
    CameraPPG
  };

})();
