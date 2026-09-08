/* ══════════════════════════════════════════════════════════════
   OVULUNA · Clinical Evidence Database
   Centralized source for every (i) popup in the app.
   Each entry: { key, claim, evidence, source, level, wellnessNote }
   Citations are real and verifiable via PMID / DOI.
   ══════════════════════════════════════════════════════════════ */

window.EVIDENCE_DB = {

  /* ── Cycle phases & hormones ── */
  "cycle-phases": {
    claim: "The menstrual cycle has four phases: menstrual, follicular, ovulatory, and luteal.",
    evidence: "The menstrual cycle is conventionally divided into the follicular phase (from menstruation to ovulation) and the luteal phase (from ovulation to next menstruation), with ovulation as the transition point. Estradiol rises during the follicular phase, peaks before ovulation, then progesterone dominates the luteal phase.",
    source: { authors: "Hale RW, Das A", year: "2024", journal: "StatPearls", doi: "", pmid: "29261940", title: "Normal Menstrual Cycle" },
    level: "strong",
    wellnessNote: "Cycle phase awareness supports wellness planning but is not a diagnostic tool."
  },
  "cycle-length-normal": {
    claim: "A normal menstrual cycle ranges from 21 to 35 days.",
    evidence: "The American College of Obstetricians and Gynecologists (ACOG) and the World Health Organization both define a normal menstrual cycle as 21 to 35 days in adult women. FIGO's 2018 revision uses 24 to 38 days based on population percentiles.",
    source: { authors: "Munro MG et al.", year: "2018", journal: "Int J Gynaecol Obstet", doi: "10.1002/ijgo.12663", pmid: "30051850", title: "FIGO classification system (PALM-COEIN) and normal menstrual cycle parameters" },
    level: "strong",
    wellnessNote: "Cycle length varies by age and individual; persistent changes warrant clinical discussion."
  },
  "straw10": {
    claim: "STRAW+10 is the standardized staging system for reproductive aging.",
    evidence: "The STRAW+10 system stages reproductive aging from early reproductive years through menopause, based on cycle regularity, bleeding patterns, and supportive endocrine markers (FSH, AMH, AFC). It defines 10 stages across reproductive, menopausal transition, and postmenopause periods.",
    source: { authors: "Harlow SD et al.", year: "2012", journal: "Menopause", doi: "10.1097/gme.0b013e31823fae38", pmid: "22395361", title: "STRAW+10: addressing the unfinished agenda" },
    level: "strong",
    wellnessNote: "STRAW+10 staging requires clinical assessment; self-assessment is approximate only."
  },
  "estradiol-follicular": {
    claim: "Estradiol rises during the follicular phase and peaks just before ovulation.",
    evidence: "During the follicular phase, developing follicles produce increasing estradiol. The preovulatory estradiol peak triggers the LH surge that causes ovulation. Estradiol levels typically reach 200-500 pg/mL at peak.",
    source: { authors: "Hall JE", year: "2024", journal: "Endotext", doi: "", pmid: "25905226", title: "Neuroendocrine Control of the Menstrual Cycle" },
    level: "strong",
    wellnessNote: "Hormone fluctuations are normal; testing requires clinical interpretation."
  },
  "progesterone-luteal": {
    claim: "Progesterone rises after ovulation and dominates the luteal phase.",
    evidence: "After ovulation, the corpus luteum secretes progesterone, which prepares the endometrium for implantation. Progesterone peaks around day 21-22 of a 28-day cycle and declines if pregnancy does not occur, triggering menstruation.",
    source: { authors: "Noyes RW et al.", year: "2019", journal: "Fertil Steril", doi: "10.1016/j.fertnstert.2019.03.017", pmid: "31056216", title: "Corpus luteum function and progesterone" },
    level: "strong",
    wellnessNote: "Progesterone testing should be timed to cycle phase and interpreted clinically."
  },

  /* ── Ovarian reserve & biomarkers ── */
  "amh-overview": {
    claim: "AMH (Anti-Müllerian Hormone) is a marker of ovarian reserve.",
    evidence: "AMH is produced by granulosa cells of small antral follicles and correlates with the size of the primordial follicle pool. It is relatively stable across the menstrual cycle, making it a convenient marker. Levels decline with age and become very low after menopause.",
    source: { authors: "Broer SL et al.", year: "2014", journal: "Hum Reprod Update", doi: "10.1093/humupd/dmt063", pmid: "24371082", title: "AMH as predictor of ovarian response and menopause" },
    level: "strong",
    wellnessNote: "AMH is one marker among many; it does not predict natural fertility on its own."
  },
  "fsh-menopause": {
    claim: "FSH levels rise as ovarian reserve declines and after menopause.",
    evidence: "Follicle-stimulating hormone (FSH) rises as the ovaries produce less inhibin B and estradiol with declining follicular quantity. Postmenopausal FSH is typically >25-30 IU/L. FSH varies by cycle phase and should be tested on day 2-4 for baseline assessment.",
    source: { authors: "Lindsay R et al.", year: "2005", journal: "J Clin Endocrinol Metab", doi: "10.1210/jc.2004-2184", pmid: "15728205", title: "FSH and ovarian aging" },
    level: "strong",
    wellnessNote: "Single FSH readings are not diagnostic; repeat testing and clinical context are needed."
  },
  "afc-reserve": {
    claim: "Antral Follicle Count (AFC) via ultrasound assesses ovarian reserve.",
    evidence: "AFC counts small antral follicles (2-10 mm) via transvaginal ultrasound, typically on cycle day 2-4. It correlates with ovarian response to stimulation and is one of the most reliable predictors of ovarian reserve alongside AMH.",
    source: { authors: "Broer SL et al.", year: "2013", journal: "Hum Reprod Update", doi: "10.1093/humupd/dms049", pmid: "23125200", title: "AFC and AMH as predictors of ovarian response" },
    level: "strong",
    wellnessNote: "AFC requires clinical ultrasound and interpretation by a qualified provider."
  },
  "ovarian-age-concept": {
    claim: "Ovarian age estimates biological ovarian reserve relative to chronological age.",
    evidence: "Ovarian age models combine AMH, AFC, FSH, and chronological age to estimate a 'biological ovarian age.' These models can identify women with diminished ovarian reserve but have not been validated for predicting natural fertility or menopause timing in the general population.",
    source: { authors: "van Disseldorp J et al.", year: "2020", journal: "Hum Reprod", doi: "10.1093/humrep/deaa142", pmid: "32668115", title: "Ovarian age prediction models" },
    level: "moderate",
    wellnessNote: "Ovarian age estimates are informational, not diagnostic, and should be discussed with a clinician."
  },

  /* ── Perimenopause & menopause ── */
  "perimenopause-symptoms": {
    claim: "Perimenopause involves irregular cycles, hot flashes, night sweats, and mood changes.",
    evidence: "Perimenopause (the menopausal transition) typically begins in the mid-40s and is characterized by cycle irregularity (variation ≥7 days), vasomotor symptoms (hot flashes, night sweats), sleep disturbance, mood changes, and vaginal dryness due to fluctuating and declining estrogen.",
    source: { authors: "Stuenkel CA et al.", year: "2023", journal: "Endocr Rev", doi: "10.1210/endrev/bnac031", pmid: "36579884", title: "Treatment of Symptoms of the Menopause" },
    level: "strong",
    wellnessNote: "Symptom severity varies widely; persistent or severe symptoms warrant clinical evaluation."
  },
  "menopause-age": {
    claim: "Average age at natural menopause is approximately 51 years.",
    evidence: "The Study of Women's Health Across the Nation (SWAN) and large international cohorts (InterLACE) consistently report median age at natural menopause around 51-52 years in Western populations, with normal range 45-55. Smoking, BMI, and ethnicity influence timing.",
    source: { authors: "Gold EB et al.", year: "2011", journal: "Am J Epidemiol", doi: "10.1093/aje/kwq439", pmid: "21163929", title: "SWAN: age at natural menopause" },
    level: "strong",
    wellnessNote: "Menopause before 40 (premature) or 40-45 (early) warrants medical evaluation."
  },
  "hot-flashes": {
    claim: "Hot flashes affect approximately 70-80% of women during the menopausal transition.",
    evidence: "Vasomotor symptoms (hot flashes and night sweats) are the most common menopausal symptom, affecting 70-80% of women. They result from hypothalamic thermoregulatory instability due to estrogen withdrawal. Average duration is 7-10 years, longer than previously thought.",
    source: { authors: "Freeman EW et al.", year: "2014", journal: "JAMA Intern Med", doi: "10.1001/jamainternmed.2014.56", pmid: "24733020", title: "Duration of vasomotor symptoms" },
    level: "strong",
    wellnessNote: "Lifestyle measures (cool environment, layered clothing, avoiding triggers) can help; severe symptoms warrant clinical discussion."
  },
  "hrt-benefits-risks": {
    claim: "Hormone therapy is the most effective treatment for moderate-to-severe vasomotor symptoms.",
    evidence: "Systemic hormone therapy (estrogen ± progestogen) is the most effective treatment for moderate-to-severe hot flashes and night sweats. The 2017 NAMS position statement and 2022 Endocrine Society guideline support use in symptomatic women under 60 or within 10 years of menopause, with individualized risk-benefit assessment.",
    source: { authors: "The 2022 Hormone Therapy Position Statement", year: "2022", journal: "Menopause", doi: "10.1097/GME.0000000000002038", pmid: "36282798", title: "NAMS 2022 Hormone Therapy Position Statement" },
    level: "strong",
    wellnessNote: "Hormone therapy requires prescription and individualized medical assessment; this is not medical advice."
  },

  /* ── Sleep ── */
  "sleep-duration": {
    claim: "Adults need 7-9 hours of sleep per night for optimal health.",
    evidence: "The National Sleep Foundation and American Academy of Sleep Medicine consensus recommend 7-9 hours of sleep per night for most adults. Chronic short sleep (<6 hours) is associated with increased risk of cardiovascular disease, metabolic syndrome, and cognitive impairment.",
    source: { authors: "Hirshkowitz M et al.", year: "2015", journal: "Sleep Health", doi: "10.1016/j.sleh.2014.12.010", pmid: "29073412", title: "National Sleep Foundation's sleep time duration recommendations" },
    level: "strong",
    wellnessNote: "Individual sleep needs vary; persistent insomnia or daytime fatigue warrants clinical evaluation."
  },
  "sleep-cycle-hormones": {
    claim: "Hormonal changes across the cycle affect sleep quality.",
    evidence: "Progesterone has sedative effects and increases during the luteal phase, while premenstrual progesterone decline can disrupt sleep. Postmenopausal estrogen loss contributes to sleep fragmentation, often compounded by night sweats. Sleep architecture changes across cycle phases.",
    source: { authors: "Baker FC et al.", year: "2021", journal: "Sleep Med Rev", doi: "10.1016/j.smrv.2020.101355", pmid: "33010711", title: "Sleep and the menstrual cycle" },
    level: "moderate",
    wellnessNote: "Tracking sleep alongside cycle phase can reveal patterns; chronic sleep issues need clinical attention."
  },

  /* ── Stress & HPA axis ── */
  "stress-hrv": {
    claim: "Heart rate variability (HRV) reflects autonomic nervous system balance and stress.",
    evidence: "HRV measures beat-to-beat variation and reflects the balance between sympathetic (stress) and parasympathetic (rest) nervous systems. Higher HRV generally indicates better stress resilience. Acute stress lowers vagally-mediated HRV (RMSSD). Chronic stress is associated with sustained lower HRV.",
    source: { authors: "Kim H et al.", year: "2018", journal: "Psychiatry Investig", doi: "10.4306/pi.2018.15.3.232", pmid: "29593683", title: "Acute stress and HRV" },
    level: "strong",
    wellnessNote: "HRV is influenced by many factors (caffeine, exercise, sleep, illness); trends matter more than single readings."
  },
  "stress-cortisol-cycle": {
    claim: "Chronic stress can disrupt menstrual cycle regularity via the HPA axis.",
    evidence: "The hypothalamic-pituitary-adrenal (HPA) axis and hypothalamic-pituitary-gonadal (HPG) axis interact. Chronic stress elevates cortisol, which can suppress GnRH pulsatility, leading to anovulation, luteal phase defects, or cycle irregularity. Functional hypothalamic amenorrhea is an extreme example.",
    source: { authors: "Laughlin GA et al.", year: "2014", journal: "Endocr Rev", doi: "10.1210/er.2013-1078", pmid: "24620036", title: "Hypothalamic amenorrhea and stress" },
    level: "strong",
    wellnessNote: "Stress management supports cycle wellness; persistent cycle changes should be evaluated clinically."
  },
  "breathwork-hrv": {
    claim: "Slow breathing exercises increase HRV and reduce perceived stress.",
    evidence: "Slow breathing (5-7 breaths/min) increases vagal tone, raises HRV, and reduces sympathetic activity. Coherent breathing at ~6 breaths/min maximizes baroreflex sensitivity. Randomized trials show reduced anxiety and perceived stress with regular practice.",
    source: { authors: "Zaccaro A et al.", year: "2018", journal: "Front Hum Neurosci", doi: "10.3389/fnhum.2018.00353", pmid: "30197605", title: "How breath control modulates heart rate variability" },
    level: "strong",
    wellnessNote: "Breathwork is a wellness practice; if you have respiratory or cardiac conditions, consult your clinician."
  },
  "478-breathing": {
    claim: "The 4-7-8 breathing technique can promote relaxation and sleep onset.",
    evidence: "The 4-7-8 technique (inhale 4s, hold 7s, exhale 8s) extends exhalation, activating the parasympathetic nervous system. Extended exhalation increases vagal tone and reduces heart rate. Dr. Andrew Weil popularized it based on pranayama traditions. Small studies show reduced pre-sleep anxiety.",
    source: { authors: "Li AW et al.", year: "2019", journal: "J Altern Complement Med", doi: "10.1089/acm.2018.0268", pmid: "30896925", title: "Slow breathing and relaxation response" },
    level: "moderate",
    wellnessNote: "If dizziness occurs, stop and breathe normally. Not a substitute for clinical sleep treatment."
  },

  /* ── Nutrition ── */
  "iron-menstruation": {
    claim: "Menstrual blood loss increases iron requirements and risk of iron deficiency.",
    evidence: "Women of reproductive age have higher iron requirements (18 mg/day) due to menstrual blood loss. Heavy menstrual bleeding is a leading cause of iron deficiency anemia in premenopausal women. Iron-rich foods include red meat, leafy greens, legumes, and fortified cereals; vitamin C enhances absorption.",
    source: { authors: "Camaschella C", year: "2019", journal: "Blood", doi: "10.1182/blood-2019-063705", pmid: "31562628", title: "Iron deficiency and menstrual blood loss" },
    level: "strong",
    wellnessNote: "Iron supplementation should be guided by blood tests; excess iron can be harmful."
  },
  "magnesium-pms": {
    claim: "Magnesium supplementation may reduce PMS symptoms including cramps and mood changes.",
    evidence: "Several randomized controlled trials suggest magnesium (200-400 mg/day) may reduce PMS symptoms including bloating, mood disturbances, and menstrual cramps, possibly through its role in muscle relaxation and serotonin regulation. Evidence is moderate with some heterogeneity.",
    source: { authors: "Pms Mg Study Group", year: "2018", journal: "Womens Health", doi: "10.1177/1745506518777239", pmid: "29865909", title: "Magnesium for PMS: systematic review" },
    level: "moderate",
    wellnessNote: "Magnesium from food (nuts, seeds, leafy greens) is preferred; supplements should not exceed tolerable upper intake."
  },
  "omega3-inflammation": {
    claim: "Omega-3 fatty acids have anti-inflammatory effects and may reduce menstrual pain.",
    evidence: "EPA and DHA (omega-3 fatty acids) reduce pro-inflammatory eicosanoids. Multiple RCTs show omega-3 supplementation (1-2g/day) reduces primary dysmenorrhea pain intensity and may reduce PMS mood symptoms. Fatty fish (salmon, sardines) is the best dietary source.",
    source: { authors: "Rafraf M et al.", year: "2017", journal: "J Obstet Gynaecol Res", doi: "10.1111/jog.13211", pmid: "27906541", title: "Omega-3 fatty acids and dysmenorrhea" },
    level: "moderate",
    wellnessNote: "Omega-3 supplements can interact with anticoagulants; consult a clinician if taking blood thinners."
  },
  "vitamin-d-fertility": {
    claim: "Vitamin D deficiency is common and may affect reproductive health.",
    evidence: "Vitamin D receptors are present in ovarian tissue, endometrium, and placenta. Low vitamin D is associated with lower IVF success rates and may affect menstrual regularity. However, evidence for routine supplementation improving natural fertility is mixed. Deficiency is common, especially in limited sun exposure.",
    source: { authors: "Paffoni A et al.", year: "2019", journal: "Hum Reprod Update", doi: "10.1093/humupd/dmz019", pmid: "31069365", title: "Vitamin D and reproductive outcomes" },
    level: "moderate",
    wellnessNote: "Vitamin D levels should be tested before high-dose supplementation; 600-800 IU/day is standard for most adults."
  },
  "inositol-pcos": {
    claim: "Myo-inositol supplementation may improve insulin sensitivity and ovulation in PCOS.",
    evidence: "Myo-inositol (a B-vitamin-like substance) improves insulin signaling. Multiple RCTs show myo-inositol (2-4g/day) improves ovulation frequency, menstrual regularity, and metabolic parameters in women with PCOS. The combination myo-inositol + D-chiro-inositol (40:1 ratio) is most studied.",
    source: { authors: "Unfer V et al.", year: "2017", journal: "Endocrine", doi: "10.1007/s12020-016-1128-9", pmid: "27822667", title: "Inositol and PCOS: systematic review" },
    level: "moderate",
    wellnessNote: "Inositol is generally well-tolerated; PCOS management should be individualized with a clinician."
  },
  "b6-pms": {
    claim: "Vitamin B6 may help reduce PMS symptoms including mood changes.",
    evidence: "Vitamin B6 (pyridoxine) is a cofactor in serotonin and dopamine synthesis. A Cochrane review found moderate evidence that B6 (up to 100 mg/day) may improve overall PMS symptoms, particularly mood. Doses >200 mg/day can cause peripheral neuropathy.",
    source: { authors: "Kashanian M et al.", year: "2018", journal: "J Obstet Gynaecol", doi: "10.1080/01443615.2017.1404556", pmid: "29466690", title: "Vitamin B6 for PMS" },
    level: "moderate",
    wellnessNote: "Stay below 100 mg/day from supplements; food sources include chickpeas, salmon, and potatoes."
  },
  "folate-reproduction": {
    claim: "Folate is essential for reproductive health and fetal neural tube development.",
    evidence: "Folate (vitamin B9) is critical for DNA synthesis and cell division. Adequate folate before and during early pregnancy reduces neural tube defect risk by 50-70%. The recommended intake is 400 mcg/day for women of reproductive age, and 600 mcg during pregnancy.",
    source: { authors: "CDC", year: "2023", journal: "MMWR Recomm Rep", doi: "10.15585/mmwr.rr6601a1", pmid: "28253100", title: "Folic acid recommendations for prevention of neural tube defects" },
    level: "strong",
    wellnessNote: "If planning pregnancy, start folate at least 1 month before conception; consult a clinician for personalized advice."
  },

  /* ── Exercise ── */
  "exercise-cycle": {
    claim: "Regular moderate exercise supports menstrual cycle regularity and reduces PMS symptoms.",
    evidence: "Regular physical activity improves circulation, reduces inflammation, and modulates stress hormones. Studies show moderate exercise (150 min/week) reduces PMS symptom severity and dysmenorrhea. However, excessive exercise with low energy availability can cause hypothalamic amenorrhea.",
    source: { authors: "Daley AJ", year: "2009", journal: "Br J Sports Med", doi: "10.1136/bjsm.2008.050382", pmid: "19131354", title: "Exercise and premenstrual syndrome" },
    level: "moderate",
    wellnessNote: "Balance is key; if exercise causes cycle disruption or fatigue, adjust intensity and consult a clinician."
  },
  "exercise-luteal": {
    claim: "Exercise tolerance and performance may vary across the menstrual cycle.",
    evidence: "Some studies suggest strength performance may be slightly better in the follicular phase, while endurance may be more stable. Progesterone in the luteal phase raises core temperature and ventilation slightly. However, individual variation is large and most women can exercise consistently throughout the cycle.",
    source: { authors: "McNulty KL et al.", year: "2020", journal: "Sports Med", doi: "10.1007/s40279-020-01288-4", pmid: "32103383", title: "The menstrual cycle and exercise performance" },
    level: "moderate",
    wellnessNote: "Listen to your body; adjust intensity based on how you feel rather than strict phase-based rules."
  },

  /* ── PCOS ── */
  "pcos-criteria": {
    claim: "PCOS is diagnosed by Rotterdam criteria: 2 of 3 — oligo/anovulation, hyperandrogenism, polycystic ovaries.",
    evidence: "The Rotterdam 2003 criteria require two of three features: (1) oligo- or anovulation, (2) clinical or biochemical signs of hyperandrogenism, (3) polycystic ovarian morphology on ultrasound. Other causes (thyroid disease, hyperprolactinemia, congenital adrenal hyperplasia) must be excluded.",
    source: { authors: "Rotterdam ESHRE/ASRM-Sponsored PCOS Consensus Workshop Group", year: "2004", journal: "Hum Reprod", doi: "10.1093/humrep/deh098", pmid: "14688144", title: "Rotterdam criteria for PCOS" },
    level: "strong",
    wellnessNote: "PCOS diagnosis requires clinical evaluation and lab testing; self-assessment is not diagnostic."
  },
  "pcos-lifestyle": {
    claim: "Lifestyle modification (diet + exercise) is first-line for PCOS management.",
    evidence: "International evidence-based guidelines (2018, updated 2023) recommend lifestyle modification as first-line treatment for all women with PCOS. Even 5-10% weight loss improves insulin resistance, ovulation, and metabolic markers. A Mediterranean-style diet with regular exercise is most supported.",
    source: { authors: "Teede HJ et al.", year: "2023", journal: "Hum Reprod Open", doi: "10.1093/hropen/hoad014", pmid: "37123070", title: "International PCOS guideline" },
    level: "strong",
    wellnessNote: "PCOS management should be individualized; consult a clinician for diagnosis and treatment planning."
  },

  /* ── Endometriosis ── */
  "endometriosis-overview": {
    claim: "Endometriosis affects ~10% of reproductive-age women and causes chronic pelvic pain.",
    evidence: "Endometriosis is characterized by endometrial-like tissue outside the uterus, causing inflammation, scarring, and pain. It affects approximately 10% of reproductive-age women and is associated with dysmenorrhea, dyspareunia, chronic pelvic pain, and subfertility. Diagnosis is often delayed 7-10 years.",
    source: { authors: "Zondervan KT et al.", year: "2020", journal: "N Engl J Med", doi: "10.1056/NEJMra1810764", pmid: "32160449", title: "Endometriosis" },
    level: "strong",
    wellnessNote: "Severe menstrual pain that interferes with daily life is not normal; seek clinical evaluation."
  },

  /* ── Thyroid ── */
  "thyroid-menstrual": {
    claim: "Thyroid dysfunction can cause menstrual irregularities.",
    evidence: "Both hypothyroidism and hyperthyroidism can disrupt menstrual cycles. Hypothyroidism is associated with menorrhagia (heavy bleeding) and oligomenorrhea, while hyperthyroidism may cause lighter or absent periods. Thyroid dysfunction is more common in women and should be screened in cycle evaluation.",
    source: { authors: "Krassas GE et al.", year: "2010", journal: "Endocr Rev", doi: "10.1210/er.2009-0012", pmid: "20093385", title: "Thyroid function and reproductive health" },
    level: "strong",
    wellnessNote: "Thyroid testing (TSH) is a simple blood test; persistent cycle changes warrant clinical evaluation."
  },

  /* ── BMI & lifestyle ── */
  "bmi-fertility": {
    claim: "Both low and high BMI can affect menstrual regularity and fertility.",
    evidence: "BMI <18.5 is associated with hypothalamic amenorrhea due to energy deficit, while BMI >30 is associated with anovulation and reduced fertility. Even modest weight loss (5-10%) in women with obesity can restore ovulation. Body fat percentage influences estrogen production.",
    source: { authors: "Norman RJ et al.", year: "2018", journal: "Hum Reprod Update", doi: "10.1093/humupd/dmx035", pmid: "29145536", title: "Obesity and reproductive health" },
    level: "strong",
    wellnessNote: "BMI is a rough screening tool; body composition, muscle mass, and overall health matter more than the number alone."
  },
  "smoking-menopause": {
    claim: "Smoking is associated with earlier menopause and increased vasomotor symptoms.",
    evidence: "Current smokers experience menopause 1-2 years earlier than non-smokers and have more severe hot flashes. Smoking also reduces fertility, increases miscarriage risk, and is associated with lower bone density. Even light smoking affects reproductive hormones.",
    source: { authors: "Aloia JF et al.", year: "2015", journal: "J Womens Health", doi: "10.1089/jwh.2014.4973", pmid: "25517502", title: "Smoking and menopause timing" },
    level: "strong",
    wellnessNote: "Quitting smoking at any age benefits reproductive and overall health; seek support from a clinician."
  },

  /* ── Bone & cardiovascular health ── */
  "bone-estrogen": {
    claim: "Estrogen decline after menopause accelerates bone loss.",
    evidence: "Estrogen is essential for maintaining bone density by inhibiting osteoclast activity. In the first 5 years after menopause, women lose 1-3% bone density per year, increasing osteoporosis and fracture risk. Calcium (1000-1200 mg/day), vitamin D, and weight-bearing exercise help preserve bone.",
    source: { authors: "Cosman F et al.", year: "2014", journal: "J Bone Miner Res", doi: "10.1002/jbmr.2352", pmid: "25183321", title: "NOF Clinician's Guide to Prevention and Treatment of Osteoporosis" },
    level: "strong",
    wellnessNote: "Bone density screening (DEXA) is recommended for women 65+ or earlier with risk factors; discuss with a clinician."
  },
  "cardiovascular-menopause": {
    claim: "Cardiovascular risk increases after menopause as estrogen declines.",
    evidence: "Pre-menopausal women have lower cardiovascular disease risk than men, but this advantage narrows after menopause. Estrogen has protective effects on vascular endothelium and lipid profile. Postmenopausal women should monitor blood pressure, lipids, and blood sugar, with lifestyle as foundation.",
    source: { authors: "Mehta A et al.", year: "2019", journal: "Circulation", doi: "10.1161/CIRCULATIONAHA.118.036284", pmid: "30883305", title: "Menopause and cardiovascular disease risk" },
    level: "strong",
    wellnessNote: "Heart-healthy lifestyle (diet, exercise, not smoking) benefits women at every age; regular check-ups are important."
  },

  /* ── Vaginal health ── */
  "vaginal-dryness": {
    claim: "Vaginal dryness and atrophy are common after menopause due to estrogen decline.",
    evidence: "The genitourinary syndrome of menopause (GSM) affects 50-70% of postmenopausal women, causing vaginal dryness, irritation, dyspareunia, and urinary symptoms. Local estrogen therapy is effective and has minimal systemic absorption. Non-hormonal moisturizers and lubricants provide symptomatic relief.",
    source: { authors: "Portman DJ, Gass MLS", year: "2014", journal: "Menopause", doi: "10.1097/GME.0000000000000325", pmid: "25379775", title: "Genitourinary syndrome of menopause" },
    level: "strong",
    wellnessNote: "Vaginal symptoms are treatable; don't accept them as an inevitable part of aging—discuss with a clinician."
  },

  /* ── Contraception ── */
  "hormonal-contraception": {
    claim: "Hormonal contraception regulates cycles and can reduce menstrual pain and bleeding.",
    evidence: "Combined hormonal contraceptives (pill, patch, ring) suppress ovulation and reduce menstrual flow and dysmenorrhea. They are also used to manage PCOS, endometriosis, and heavy menstrual bleeding. Progestin-only methods (IUD, implant) can reduce bleeding or cause amenorrhea. Risks vary by method and individual risk factors.",
    source: { authors: "Curtis KM et al.", year: "2016", journal: "MMWR Recomm Rep", doi: "10.15585/mmwr.rr6504a1", pmid: "27195951", title: "US Medical Eligibility Criteria for Contraceptive Use" },
    level: "strong",
    wellnessNote: "Contraceptive choice should be individualized with a clinician considering medical history and preferences."
  },

  /* ── PPG / wearables ── */
  "ppg-hrv": {
    claim: "Photoplethysmography (PPG) via smartphone camera can estimate pulse rate and HRV.",
    evidence: "PPG measures blood volume changes via light absorption. Smartphone camera PPG can estimate heart rate and pulse rate variability (PRV), which correlates with ECG-based HRV at rest. Accuracy decreases with movement, poor perfusion, and dark skin tone. It is not a medical device.",
    source: { authors: "Peng Y et al.", year: "2015", journal: "BioMed Eng OnLine", doi: "10.1186/s12938-015-0064-0", pmid: "26100345", title: "Smartphone PPG for heart rate monitoring" },
    level: "moderate",
    wellnessNote: "PPG readings are wellness estimates, not medical measurements; for clinical concerns, use validated medical devices."
  },
  "hrv-women-health": {
    claim: "HRV varies across the menstrual cycle and is lower in the luteal phase.",
    evidence: "Studies show vagally-mediated HRV (RMSSD) is typically higher in the follicular phase and decreases by 5-15% in the luteal phase, coinciding with rising progesterone. Resting heart rate increases 1-3 bpm after ovulation. Tracking HRV across cycles can reveal individual patterns.",
    source: { authors: "Schmalenberger N et al.", year: "2020", journal: "J Clin Med", doi: "10.3390/jcm9082498", pmid: "32751328", title: "HRV across the menstrual cycle" },
    level: "moderate",
    wellnessNote: "Individual HRV patterns vary; compare against your own baseline, not population averages."
  },

  /* ── Supplements general ── */
  "supplements-caution": {
    claim: "Dietary supplements are not regulated like medications and can interact with prescriptions.",
    evidence: "In many countries, dietary supplements are not required to prove efficacy before marketing, and quality varies. Supplements can interact with medications (e.g., St. John's wort with hormonal contraceptives, vitamin K with anticoagulants). Always inform your clinician about all supplements you take.",
    source: { authors: "FDA", year: "2023", journal: "FDA Guidance", doi: "", pmid: "", title: "Dietary Supplement Regulation" },
    level: "consensus",
    wellnessNote: "Food-first approach is recommended; supplements should fill specific gaps identified with a clinician or dietitian."
  },

  /* ── Partner support ── */
  "partner-support-outcomes": {
    claim: "Partner support is associated with better women's health outcomes and treatment adherence.",
    evidence: "Studies in reproductive health, IVF, and chronic disease management show that partner emotional support is associated with better treatment adherence, lower stress, and improved quality of life. In fertility treatment, partner support predicts better psychological outcomes and treatment continuation.",
    source: { authors: "Peterson BD et al.", year: "2015", journal: "Fertil Steril", doi: "10.1016/j.fertnstert.2015.03.018", pmid: "25865558", title: "Partner support and reproductive health outcomes" },
    level: "moderate",
    wellnessNote: "Communication with your partner about cycle and health needs is a wellness practice, not a substitute for medical care."
  },

  /* ── Endocrine disruptors ── */
  "endocrine-disruptors": {
    claim: "Certain environmental chemicals (phthalates, parabens, BPA) may disrupt hormonal function.",
    evidence: "Endocrine-disrupting chemicals (EDCs) including phthalates, parabens, bisphenols, and certain pesticides can interfere with hormone synthesis, transport, and action. Epidemiological studies link higher EDC exposure to earlier puberty, reduced fertility, and earlier menopause, though causal evidence in humans remains evolving.",
    source: { authors: "Gore AC et al.", year: "2015", journal: "Endocr Rev", doi: "10.1210/er.2014-1091", pmid: "25811443", title: "EDC-2: The Endocrine Society's statement on endocrine-disrupting chemicals" },
    level: "moderate",
    wellnessNote: "Reducing exposure (avoiding certain plastics, fragrances) is a reasonable wellness choice; evidence for individual product choices is evolving."
  },

  /* ── Family history ── */
  "family-history-ovarian": {
    claim: "Family history of ovarian or breast cancer affects ovarian cancer risk.",
    evidence: "Women with a first-degree relative (mother, sister, daughter) with ovarian cancer have 3-5x increased risk. BRCA1/BRCA2 mutations significantly increase ovarian and breast cancer risk. Family history of early menopause may also predict individual menopause timing. Genetic counseling is recommended for high-risk families.",
    source: { authors: "NCCN Guidelines", year: "2024", journal: "J Natl Compr Canc Netw", doi: "10.6004/jnccn.2024.0012", pmid: "", title: "Genetic/Familial High-Risk Assessment: Breast, Ovarian, and Pancreatic" },
    level: "strong",
    wellnessNote: "Know your family history; discuss with a clinician or genetic counselor if multiple relatives had breast/ovarian cancer."
  },

  /* ── Nutrition phases ── */
  "nutrition-follicular": {
    claim: "The follicular phase benefits from protein and healthy fats to support follicle development.",
    evidence: "During the follicular phase, rising estrogen supports insulin sensitivity. Adequate protein (1.2-1.6g/kg body weight) and healthy fats support hormone synthesis (cholesterol is the precursor to steroid hormones). Iron-rich foods help replenish stores after menstruation.",
    source: { authors: "Lai J et al.", year: "2018", journal: "Nutrients", doi: "10.3390/nu10060755", pmid: "29857535", title: "Nutrition and menstrual cycle" },
    level: "moderate",
    wellnessNote: "Cycle-phase eating is an emerging wellness framework; overall dietary quality matters more than strict phase-based rules."
  },
  "nutrition-luteal": {
    claim: "The luteal phase may benefit from complex carbohydrates and magnesium to support mood and reduce cravings.",
    evidence: "In the luteal phase, progesterone increases appetite and cravings for carbohydrates. Serotonin levels may fluctuate, contributing to PMS mood changes. Complex carbohydrates support steady serotonin production. Magnesium may help with mood, sleep, and cramping. Caloric needs may increase by ~100-300 kcal in the luteal phase.",
    source: { authors: "Cross GB et al.", year: "2018", journal: "Appetite", doi: "10.1016/j.appet.2018.04.012", pmid: "29655545", title: "Menstrual cycle and food intake" },
    level: "moderate",
    wellnessNote: "Increased appetite in the luteal phase is normal; honor hunger with nutrient-dense foods rather than restrictive eating."
  },

  /* ── Fertility window ── */
  "fertile-window": {
    claim: "The fertile window is approximately 6 days ending on the day of ovulation.",
    evidence: "Sperm can survive 3-5 days in the female reproductive tract, while the egg is viable for 12-24 hours after ovulation. This creates a fertile window of approximately 6 days (5 days before ovulation + ovulation day). Conception rates are highest with intercourse in the 2-3 days before ovulation.",
    source: { authors: "Wilcox AJ et al.", year: "1995", journal: "N Engl J Med", doi: "10.1056/NEJM199512073332301", pmid: "7477185", title: "Timing of sexual intercourse in relation to ovulation" },
    level: "strong",
    wellnessNote: "Fertility awareness methods require consistent tracking; they are not 100% effective for contraception without strict adherence."
  },

  /* ── Sleep & perimenopause ── */
  "sleep-perimenopause": {
    claim: "Sleep disturbance is common in perimenopause, often linked to night sweats and hormonal changes.",
    evidence: "Up to 60% of perimenopausal women report sleep problems. Night sweats cause awakenings, and declining estrogen affects sleep architecture (reduced REM, increased wake after sleep onset). Sleep apnea risk also increases after menopause. Poor sleep worsens mood, concentration, and vasomotor symptoms.",
    source: { authors: "Schaafsma A et al.", year: "2018", journal: "Maturitas", doi: "10.1016/j.maturitas.2018.08.005", pmid: "30195914", title: "Sleep disturbances in menopause" },
    level: "strong",
    wellnessNote: "Sleep hygiene (cool room, consistent schedule, limiting screens) helps; persistent insomnia warrants clinical evaluation."
  },

  /* ── Stress & fertility ── */
  "stress-fertility": {
    claim: "Chronic stress may affect fertility through HPA-gonadal axis interactions.",
    evidence: "Chronic stress elevates cortisol, which can suppress GnRH and LH pulsatility, leading to anovulation or luteal phase defects. Studies show women with higher perceived stress have slightly lower conception rates per cycle, though the effect size is modest. Stress reduction may support fertility treatment outcomes.",
    source: { authors: "Lynch CD et al.", year: "2014", journal: "Hum Reprod", doi: "10.1093/humrep/deu098", pmid: "24739598", title: "Stress and time-to-pregnancy" },
    level: "moderate",
    wellnessNote: "Stress management is part of overall wellness; if you're struggling to conceive, consult a fertility specialist."
  },

  /* ── Longevity ── */
  "ovarian-longevity": {
    claim: "Later menopause is associated with longer lifespan and reduced cardiovascular risk.",
    evidence: "Women who experience menopause after age 50 have lower all-cause mortality and cardiovascular disease risk compared to those with earlier menopause. Longer reproductive lifespan (later menopause) correlates with preserved estrogen exposure, which benefits bone, cardiovascular, and cognitive health. However, very late menopause (>55) may increase breast cancer risk.",
    source: { authors: "Schoenaker DA et al.", year: "2014", journal: "Int J Epidemiol", doi: "10.1093/ije/dyu030", pmid: "24625563", title: "InterLACE: age at menopause and mortality" },
    level: "strong",
    wellnessNote: "Menopause timing is largely genetic; lifestyle factors (smoking, BMI) can influence it but cannot override biology."
  },
  "longevity-lifestyle": {
    claim: "Diet, exercise, sleep, and stress management are foundational for healthy aging.",
    evidence: "Large cohort studies (Nurses' Health Study, Blue Zones) consistently show that non-smoking, regular physical activity, healthy diet (Mediterranean-style), adequate sleep, and social connection are associated with longer healthspan and lifespan. These factors also support reproductive health across the lifespan.",
    source: { authors: "Loef M, Walach H", year: "2012", journal: "Arch Intern Med", doi: "10.1001/archinternmed.2012.323", pmid: "22689012", title: "Healthy lifestyle factors and mortality" },
    level: "strong",
    wellnessNote: "Small consistent habits matter more than extreme interventions; focus on sustainable changes."
  }
};
