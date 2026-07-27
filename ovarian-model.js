/* Nemow — shared Ovarian Age model (single source of truth).
   Used by onboarding and ovarian-age.html (full assessment).
   Keep both in sync via THIS file only. */
(function(g){
  function expectedAMHForAge(age){
    if(age<25) return 4.0; if(age<30) return 3.2; if(age<35) return 2.4; if(age<38) return 1.6;
    if(age<40) return 1.1; if(age<43) return 0.7; if(age<45) return 0.4; if(age<48) return 0.2; return 0.1;
  }
  function estimateTimeToFMP(age, amh, momMeno, smoke, cycle, circ, sleep){
    var popMedianFMP=51, baseFMP=popMedianFMP;
    if(momMeno) baseFMP=0.55*momMeno+0.45*popMedianFMP;
    if(smoke==='current') baseFMP-=1.5; else if(smoke==='former') baseFMP-=0.5;
    if(circ==='chronic') baseFMP-=0.6; else if(circ==='some') baseFMP-=0.2;
    if(sleep==='poor') baseFMP-=0.3;
    var amhAdj=0, ciHalf=6;
    if(amh!=null && amh>=0){ var expected=expectedAMHForAge(age), ratio=amh/Math.max(expected,0.05);
      amhAdj=-Math.max(-5,Math.min(5,-2.2*Math.log(ratio))); ciHalf=age<40?4.5:(age<45?3.5:2.5); }
    else { if(age>=45) ciHalf=4.5; else if(age>=40) ciHalf=5.5; }
    if(cycle==='post12') return {median:0,lo:0,hi:0,postFMP:true};
    if(cycle==='skipped') return {median:1.5,lo:0.5,hi:3.5};
    if(cycle==='variable') ciHalf=Math.min(ciHalf,4);
    var predictedFMP=baseFMP+amhAdj, median=Math.max(0,predictedFMP-age);
    return {median:median, lo:Math.max(0,median-ciHalf), hi:median+ciHalf};
  }
  function strawStage(age, cycle){
    if(cycle==='post12') return (age&&age>=60)?{code:'+2',name:'late postmenopause'}:{code:'+1',name:'early postmenopause'};
    if(cycle==='skipped') return {code:'-1',name:'late menopause transition'};
    if(cycle==='variable') return {code:'-2',name:'early menopause transition'};
    if(cycle==='contraceptive') return {code:'?',name:'cycle masked by contraception'};
    if(age&&age>=40) return {code:'-3a',name:'late reproductive'};
    return {code:'-3b',name:'peak reproductive'};
  }
  function computeOvarianAge(i){
    var ttm=estimateTimeToFMP(i.age, i.amh, i.momMeno, i.smoke, i.cycle, i.circ, i.sleep);
    var straw=strawStage(i.age, i.cycle);
    var ovAge=i.age;
    if(!ttm.postFMP) ovAge=i.age+((51-i.age)-ttm.median); else ovAge=Math.max(i.age,51);
    ovAge=Math.round(ovAge);
    return {ovAge:ovAge, chrono:i.age, delta:ovAge-i.age, straw:straw, ttm:ttm};
  }
  g.OvarianModel={ expectedAMHForAge:expectedAMHForAge, estimateTimeToFMP:estimateTimeToFMP, strawStage:strawStage, computeOvarianAge:computeOvarianAge };
})(typeof window!=='undefined'?window:this);
