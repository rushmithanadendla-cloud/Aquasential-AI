const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const pages=["overview","quality","usage","alerts","assistant"];
function go(p){pages.forEach(x=>$("#"+x).classList.toggle("show",x===p));$$("[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===p));$("#crumb").textContent=({overview:"Overview",quality:"Water Quality",usage:"Usage Insights",alerts:"Alerts",assistant:"AI Assistant"})[p];window.scrollTo({top:0,behavior:"smooth"});}
$$("[data-page]").forEach(b=>b.onclick=()=>go(b.dataset.page));$$("[data-goto]").forEach(b=>b.onclick=()=>go(b.dataset.goto));
function toast(t){$("#toast").textContent=t;$("#toast").classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>$("#toast").classList.remove("show"),2400)}
$("#refresh").onclick=()=>{$("#updated").textContent="Updated just now";toast("Demo dashboard refreshed.");};
const indicators=[["pH","7.2","pH describes how acidic or alkaline water is. Around 7 is neutral; interpretation depends on the intended use and applicable standards."],["Turbidity","1.1 NTU","Turbidity measures cloudiness caused by suspended particles. A low reading alone does not prove water is safe."],["Total dissolved solids","280 mg/L","TDS estimates dissolved substances such as salts and minerals. It does not identify substances or establish safety by itself."],["Temperature","24.6 °C","Temperature can affect readings and biological processes. Compare with the system baseline."]];
$("#indicators").innerHTML=indicators.map((x,i)=>`<button class="indicator" data-i="${i}"><span><b>${x[0]}</b><small>Example reading · click to learn</small></span><span>${x[1]}<small>↗ details</small></span></button>`).join("");
$$("[data-i]").forEach(b=>b.onclick=()=>toast(indicators[+b.dataset.i][2]));
function calculateQuality(p,t,d){
  // Transparent demo score: relative to configured example ranges only; not a drinking-water safety score.
  const phScore=Math.max(0,100-(Math.abs(p-7)*18));
  const turbScore=Math.max(0,100-(t*9));
  const tdsScore=Math.max(0,100-(Math.max(0,d-100)*0.09));
  return Math.round(phScore*0.4+turbScore*0.3+tdsScore*0.3);
}
function updateDashboardQuality(score,p,t,d){
  const metric=document.querySelector(".metrics article");
  if(metric){
    const h=metric.querySelector("h3");
    if(h)h.innerHTML=`<span id="qualityMetric">${score}</span> <small>/ 100</small>`;
    const bar=metric.querySelector(".progress i");
    if(bar)bar.style.width=score+"%";
    const status=metric.querySelector("article>small")||metric.querySelectorAll("small")[1];
    if(status)status.textContent=score>=80?"Within demo target range":score>=60?"Review readings recommended":"Readings need attention";
  }
  const tag=document.querySelector("#overview .quality .tag");
  if(tag)tag.textContent=score+" / 100";
  const circle=document.querySelector("#overview .quality .circle");
  if(circle){
    const small=circle.querySelector("small");
    circle.childNodes.forEach(n=>{if(n.nodeType===Node.TEXT_NODE)n.textContent=""});
    circle.insertBefore(document.createTextNode(String(score)),small);
    circle.style.background=`conic-gradient(#c4a7ff 0 ${score}%,#35264d ${score}% 100%)`;
  }
  const qtitle=document.querySelector("#overview .quality .score h2");
  const qdesc=document.querySelector("#overview .quality .score p");
  if(qtitle)qtitle.textContent=score>=80?"Good demo indicator range":score>=60?"Readings need review":"Readings need attention";
  if(qdesc)qdesc.textContent=`Current entered sample: pH ${p.toFixed(1)}, turbidity ${t} NTU, TDS ${d} mg/L. This illustrative index is not a drinking-water safety result.`;
  const updated=$("#updated");if(updated)updated.textContent="Updated just now";
}
function analyzeReadings(){
  const p=Number($("#ph").value),t=Number($("#turb").value),d=Number($("#tds").value);
  if(!Number.isFinite(p)||!Number.isFinite(t)||!Number.isFinite(d)||p<0||p>14||t<0||d<0){
    $("#result").textContent="Enter valid readings: pH from 0–14, turbidity and TDS must be zero or greater.";return;
  }
  const n=[];
  if(p<6.5||p>8.5)n.push("pH is outside this demo's example range (6.5–8.5).");
  if(t>5)n.push("Turbidity exceeds the demo review threshold (5 NTU).");
  if(d>500)n.push("TDS exceeds the demo review threshold (500 mg/L).");
  const score=calculateQuality(p,t,d);
  updateDashboardQuality(score,p,t,d);
  $("#result").textContent=(n.length?"Review recommended: "+n.join(" "):"The readings are within this demo's example ranges. ")+` Demo indicator score: ${score}/100. This is only a rule-based illustration and cannot determine drinking-water safety. Use qualified testing and local standards.`;
  addReadingAlerts(p,t,d,n);
}
$("#readingForm").onsubmit=e=>{e.preventDefault();analyzeReadings();};
["ph","turb","tds"].forEach(id=>$("#"+id).addEventListener("change",()=>{ /* Changes are applied when Analyze sample is pressed. */ }));
let alerts=[{id:1,title:"Evening usage anomaly",desc:"Sample data shows higher-than-usual usage between 6 PM and 8 PM. Check for running taps, irrigation schedules, or possible leaks.",time:"Today · 18:20",done:false},{id:2,title:"Sensor reading check",desc:"A sample indicator is due for routine verification. Compare with a calibrated instrument before decisions.",time:"Today · 09:10",done:false}];
function addReadingAlerts(p,t,d,issues){
  const findings=[];
  if(p<6.5||p>8.5)findings.push({title:"pH reading outside example range",desc:`The entered pH value is ${p}. Verify the probe calibration and repeat the measurement.`});
  if(t>5)findings.push({title:"Elevated turbidity reading",desc:`The entered turbidity is ${t} NTU. Repeat the reading and investigate the source of cloudiness.`});
  if(d>500)findings.push({title:"TDS reading above demo threshold",desc:`The entered TDS is ${d} mg/L. Check the instrument and compare with the relevant local guidance.`});
  if(!findings.length)findings.push({title:"New sample analyzed",desc:`A sample with pH ${p}, turbidity ${t} NTU and TDS ${d} mg/L was analyzed. The demo rules did not flag the configured thresholds; this does not certify safety.`});
  findings.forEach(f=>alerts.unshift({id:Date.now()+Math.random(),title:f.title,desc:f.desc,time:"Just now",done:false}));
  renderAlerts();
}
function renderAlerts(){$("#alertsList").innerHTML=alerts.map(a=>`<article class="alertcard ${a.done?"reviewed":""}"><span class="bang">${a.done?"✓":"!"}</span><div><h3>${a.title}</h3><p>${a.desc}</p><small>${a.time} · ${a.done?"Reviewed":"Review recommended"}</small></div><button data-review="${a.id}">${a.done?"Reviewed":"Mark reviewed"}</button></article>`).join("");let n=alerts.filter(a=>!a.done).length;$("#alertCount").textContent=n;$("#activeAlerts").innerHTML=String(n).padStart(2,"0")+" <small>alerts</small>";$$("[data-review]").forEach(b=>b.onclick=()=>{alerts.find(a=>a.id===+b.dataset.review).done=true;renderAlerts();toast("Alert marked reviewed.");});}
renderAlerts();$("#reviewAll").onclick=()=>{alerts.forEach(a=>a.done=true);renderAlerts();toast("All sample alerts reviewed.");};
$("#range").onchange=e=>toast("Showing illustrative "+e.target.value.toLowerCase()+" pattern.");
const knowledge=[
[["what is water cycle","water cycle"],"The water cycle is the continuous movement of water through evaporation, condensation, precipitation, and collection. For example, sunlight evaporates water, clouds form, and rain returns water to land."],
[["boiling water","boil water"],"Boiling can kill many disease-causing microbes when done correctly, but it does not remove many dissolved chemicals or heavy metals and can concentrate some contaminants. Follow local public-health advice if water quality is uncertain."],
[["rainwater harvesting","harvesting rain"],"Rainwater harvesting collects and stores rain from roofs or other surfaces. A basic system includes a clean catchment, a first-flush diverter, filtration appropriate to the use, and covered storage. Drinking use needs treatment and testing."],
[["hard water","water hardness"],"Hard water contains higher levels of dissolved minerals, especially calcium and magnesium. It can leave scale on taps and appliances. Hardness is different from microbial safety."],
[["water pollution","polluted water"],"Water pollution occurs when harmful substances or organisms enter water. Sources can include sewage, industrial discharge, farm runoff, and litter. Prevention includes proper waste disposal, treatment, and protecting waterways."],
[["water footprint"],"A water footprint estimates the water used directly and indirectly to make goods or provide services. Food, clothing, electricity, and household use can all contribute."],
[["climate change","global warming"],"Climate change affects water through shifts in rainfall, drought risk, floods, evaporation, and water demand. Local impacts differ, so planning should use regional climate and water data."],
[["renewable energy"],"Renewable energy comes from sources that replenish naturally, such as sunlight, wind, and flowing water. Hydropower uses moving water, though its environmental and community impacts depend on the project."],
[["machine learning"],"Machine learning is a branch of AI where a system learns patterns from examples. For instance, a model could learn typical daily water use and flag unusual changes, but it needs reliable data and human review."],
[["internet of things","iot"],"The Internet of Things connects physical devices—such as water meters or sensors—to software. An IoT water-monitoring setup may send pH, flow, or tank-level readings to a dashboard, provided sensors are calibrated and securely connected."],
[["how to check water quality"],"Start with the intended use and the relevant local standard. Field measurements like pH, turbidity, and TDS are useful indicators, but drinking-water assessment may also require microbial and chemical lab tests."],
[["why is water important"],"Water supports hydration, food production, sanitation, ecosystems, and industry. Safe water access also depends on protecting sources, maintaining infrastructure, and monitoring quality."],

[["how are you","how are u"],"I'm doing well, thanks for asking! I'm here and ready to help. How are you doing today?"],
[["what is your name","who are you"],"I'm Aqua, the Aquasential AI demo assistant. I can chat about everyday topics and general knowledge, and I can also help with water quality, usage, leaks, and conservation."],
[["what is aquasential","aquasential"],"Aquasential AI is a water-intelligence prototype designed to help people review water-quality indicators, understand usage patterns, and explore conservation ideas."],
[["what is ai","artificial intelligence"],"Artificial intelligence (AI) is a field of computing that builds systems able to perform tasks such as recognizing patterns, understanding language, and making predictions. For example, a spam filter uses patterns to identify likely unwanted email."],
[["capital of india"],"The capital of India is New Delhi."],
[["capital of the world","capital of world"],"There is no single capital of the world. The United Nations headquarters is in New York City, but that does not make it a world capital."],
[["largest planet"],"Jupiter is the largest planet in our Solar System."],
[["red planet"],"Mars is often called the Red Planet because iron minerals in its soil give it a reddish appearance."],
[["photosynthesis"],"Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to make sugars and release oxygen. For example, a plant's leaves capture light to help it grow."],
[["what is python","python programming"],"Python is a general-purpose programming language known for readable syntax. For example, print('Hello, world!') displays a message. It is used in automation, data analysis, web development, and AI."],
[["tell me a joke","make me laugh"],"Why did the computer go to the doctor? It had a virus! Want another joke or would you prefer a useful fact?"],
[["good morning","good evening","good afternoon"],"Hello! Hope your day is going well. What would you like to talk about?"],

[["ph","acid","alkaline"],"pH describes how acidic or alkaline water is, on a scale commonly running from 0 to 14. Around 7 is neutral. For example, lemon juice is acidic while many soaps are alkaline. pH by itself does not prove water is safe."],
[["turbidity","cloudy","cloudiness"],"Turbidity measures cloudiness caused by suspended particles. Imagine shining a torch through clear water versus muddy water: the muddy sample scatters more light. High turbidity may need investigation, but low turbidity cannot rule out invisible contaminants."],
[["tds","dissolved solids"],"TDS means total dissolved solids. It estimates dissolved substances such as salts and minerals. A pinch of salt can dissolve while water stays clear. TDS does not tell you exactly which substances are present."],
[["reduce","save water","conserve","conservation","less water"],"Start with a baseline and look for easy wins: repair dripping taps, shorten running-water tasks, run full laundry loads, and check outdoor watering schedules. Compare weekly totals to see whether changes help."],
[["leak","leaking"],"If you suspect a leak, check for visible drips and damp areas. If safe, turn off water-using appliances and observe the meter; unexpected movement may suggest flow. Avoid electrical equipment near water. For a hidden leak, contact maintenance or a licensed plumber."],
[["safe to drink","drink","drinking"],"This dashboard cannot determine whether water is safe to drink. Clear appearance, normal pH, or low TDS do not rule out microbes or chemical contaminants. Use an approved laboratory or local public-health guidance."],
[["usage","consumption","litre","liter"],"Compare readings across similar time windows and days. Look for sudden changes rather than judging one number. This prototype chart is illustrative; connect a verified meter feed before making real decisions."],
[["sensor","reading","measurement"],"For reliable readings, follow sensor instructions, calibrate with appropriate standards, keep probes clean, record timestamps, and compare with a trusted reference. Repeat sudden changes before assuming they represent a real event."],
[["hello","hi","hey"],"Hi! I'm Aqua, the Aquasential demo assistant. I can explain water-quality indicators, help interpret the sample dashboard, or suggest conservation ideas. What's on your mind?"],
[["thank"],"You're welcome! We can look at a reading or turn an idea into a practical water-saving checklist."]];
function answer(q){q=q.toLowerCase();for(let [keys,a] of knowledge)if(keys.some(k=>q.includes(k)))return a;if(q.includes("alert"))return "The alerts are sample scenarios: an evening usage anomaly and a routine sensor check. Verify the underlying source before acting; prototype alerts are not proof of a real issue.";if(/\\b(hi|hello|hey|hii)\\b/.test(q))return "Hey! Good to hear from you. I'm Aqua. We can talk casually, explore a general-knowledge question, or work through a water-related question. What's on your mind?";
if(/\\b(thank you|thanks)\\b/.test(q))return "You're welcome! Glad I could help. Is there anything else you'd like to know?";
if(/\\b(who|what|why|when|where|how|can you|tell me|explain)\\b/.test(q))return "I'll do my best to help. I can answer common general-knowledge questions and explain water topics. Could you add a little detail so I can give you a more specific answer?";
return "I'm listening. You can ask me about everyday topics, general knowledge, AI, programming basics, or water quality and conservation. I'm a local demo assistant with built-in answers, so I may not know every question, but I'll try to guide you usefully."}
function message(text,user){let d=document.createElement("div");d.className="bubble "+(user?"user":"ai");let s=document.createElement("small");s.textContent=user?"YOU":"AQUA · AI ASSISTANT";let p=document.createElement("p");p.textContent=text;d.append(s,p);$("#messages").append(d);$("#messages").scrollTop=$("#messages").scrollHeight;}
function send(q){if(!q.trim())return;message(q,true);setTimeout(()=>message(answer(q),false),220);}
$("#chatForm").onsubmit=e=>{e.preventDefault();let i=$("#chatInput"),q=i.value;i.value="";send(q)};$$("[data-prompt]").forEach(b=>b.onclick=()=>send(b.dataset.prompt));
