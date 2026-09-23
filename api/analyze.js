export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Use POST'});
  const {leads}=req.body||{};
  if(!Array.isArray(leads)||!leads.length) return res.status(400).json({error:'Add at least one lead with interaction history.'});
  if(leads.length>8) return res.status(400).json({error:'Analyze up to 8 leads at a time.'});
  for(const l of leads){if(!l.name?.trim()||!Array.isArray(l.interactions)||!l.interactions.length) return res.status(400).json({error:'Every lead needs a name and at least one interaction.'});}
  const key=process.env.TYPESAFE_API_KEY;
  if(!key) return res.status(503).json({error:'Jev is not configured.'});
  const questions={};
  leads.forEach((l,i)=>{
    const ctx={lead:{name:l.name,company:l.company||null,role:l.role||null,context:l.context||null},interactions:l.interactions.slice(-30)};
    questions[`intent_${i}`]={type:'score',instructions:{question:'Based only on the interaction history, how strong is the buying intent this lead is showing?',...ctx},criteria:['No buying signal; purely passive or one-way','Early curiosity; light engagement, no action','Active evaluation; asks questions, compares, requests detail','Clear buying signal; discusses terms, timeline, implementation or procurement']};
    questions[`trust_${i}`]={type:'score',instructions:{question:'How much relationship trust is visible in the interaction history?',...ctx},criteria:['Cold or guarded; formal, minimal disclosure','Warming; responds, shares some context','Trusted; shares internal detail, seeks advice','Champion-level; advocates internally, volunteers sensitive context']};
    questions[`velocity_${i}`]={type:'choice',instructions:{question:'What is the engagement velocity trend across the timeline?',...ctx},criteria:{accelerating:'Touches getting more frequent or higher-bandwidth over time',steady:'Consistent cadence without clear acceleration',stalling:'Cadence slowing, shorter replies, longer gaps','gone-cold':'Extended silence after prior engagement'}};
    questions[`pattern_${i}`]={type:'choice',instructions:{question:'Which behaviour pattern best explains this lead right now?',...ctx},criteria:{'champion-forming':'An internal advocate is emerging and pulling the deal forward','multi-threading':'Multiple stakeholders engaging across channels','single-threaded':'One contact only; deal rests on a single relationship','ghosting':'Previously engaged, now unresponsive','price-shopping':'Engagement centers on price and comparison, low relationship depth','methodical-evaluator':'Structured, criteria-driven evaluation progressing steadily'}};
    questions[`nextmove_${i}`]={type:'choice',instructions:{question:'Given the intent, trust, velocity and pattern, what is the single best next move for the seller?',...ctx},criteria:{'book-meeting':'Ask for a concrete meeting or demo slot now','send-tailored-proof':'Send a tailored case study, proposal or technical validation','multi-thread':'Proactively engage additional stakeholders','exec-sponsor':'Bring in an executive sponsor on either side','nurture':'Stay in light touch; not ready for a push','disqualify':'Stop active pursuit; park the lead'}};
  });
  const started=Date.now();
  const r=await fetch('https://api.typesafe.ai/v1/systemone',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:'jev-latest',state:{leads:leads.map(l=>({name:l.name,company:l.company||null,interactions:l.interactions.slice(-30)}))},questions})});
  const data=await r.json();
  if(!r.ok) return res.status(502).json({error:'Jev analysis failed.',detail:data?.message||data?.error||'Upstream error'});
  const results=leads.map((l,i)=>{
    const it=data.answers[`intent_${i}`],tr=data.answers[`trust_${i}`],ve=data.answers[`velocity_${i}`],pa=data.answers[`pattern_${i}`],nm=data.answers[`nextmove_${i}`];
    const lv=x=>Math.max(0,Math.min(3,Math.round(x.score??x.value??0)));
    return {name:l.name,intent:{level:lv(it),confidence:Math.round((it.confidence??0)*100),distribution:it.probabilities},trust:{level:lv(tr),confidence:Math.round((tr.confidence??0)*100),distribution:tr.probabilities},velocity:{trend:ve.choice,probabilities:ve.probabilities},pattern:{signal:pa.choice,probabilities:pa.probabilities},nextMove:{move:nm.choice,probabilities:nm.probabilities},confidence:Math.round(((it.confidence??0)+(tr.confidence??0)+(ve.confidence??0)+(pa.confidence??0)+(nm.confidence??0))/5*100)};
  });
  res.status(200).json({results,meta:{model:data.model,inputTokens:data.usage?.input_tokens,latencyMs:Date.now()-started,analyzedAt:new Date().toISOString(),policy:'Intent, trust, velocity, pattern and next move are Jev judgments on the supplied interactions only. Timeline and touch math are computed deterministically.'}});
}
