/* Presentation only. Winner, edge, recommendations and analyst ranking come from the contract. */
(function(root){
'use strict';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pct=x=>x==null?'Unavailable':(x*100).toFixed(1)+'%';
const num=x=>x==null?'—':x.toFixed(3);
const label=x=>String(x).replaceAll('_',' ');
function claims(items){return (items||[]).map(c=>`<li>${esc(c.text)} <span class="reference">[${esc(c.evidence_ref)}]</span></li>`).join('');}
function renderCard(p){
 if(p.schema_version!=='mlb.prediction.v2.1')throw Error('Unsupported prediction contract');
 const winner=p.predicted_side?p[p.predicted_side]:'No directional forecast';
 const component=(name,value)=>`<div class="component"><span>${name}</span><strong>${pct(value)}</strong></div>`;
 const performance=a=>`${a.performance.n} answered / ${a.performance.eligible} eligible · Brier ${num(a.performance.brier)} · log loss ${num(a.performance.log_loss)} · coverage ${pct(a.performance.coverage)} · calibration gap ${pct(a.performance.calibration_error)}`;
 const featured=p.specialists.filter(a=>p.featured_analysts.includes(a.analyst));
 return `<article class="card" data-game="${esc(p.game_id)}"><div class="card-top"><div class="meta"><span>${esc(p.start_at.slice(11,16))} UTC</span><span class="badge">${esc(label(p.status))}</span></div><h2>${esc(p.away)} <small>at</small> ${esc(p.home)}</h2><div class="forecast"><div><div class="label">Final system lean</div><div class="winner">${esc(winner)}</div></div><div class="prob">${pct(p.predicted_side_probability)}</div></div><div class="metrics"><div><span class="label">Market · home win</span><span class="metric-value">${pct(p.market_home_probability)}</span></div><div><span class="label">Edge · predicted side</span><span class="metric-value">${p.edge==null?'Unavailable':(p.edge*100).toFixed(1)+' pp'}</span></div></div><p class="lede">${esc(p.analysis.evidence[0]?.text||p.analysis.risks[0]||p.analysis.headline)}</p>${featured.map(a=>`<div class="featured"><strong>FEATURED · ${esc(label(a.analyst))}</strong><p>${pct(a.home_probability)} home win</p><small>${performance(a)}</small></div>`).join('')}<div class="quality">Evidence domain coverage ${pct(p.evidence_quality.domain_coverage)} · ${esc(p.uncertainty.level)} uncertainty</div></div><details><summary>Expanded analysis & component estimates</summary><div class="detail-body"><p>${esc(p.analysis.headline)}</p><h3>Home-win estimates</h3>${component('Final system',p.final_home_probability)}${component('Collaborative specialists',p.collaborative_home_probability)}${component('Statistical model only',p.model_home_probability)}<p>Component disagreement: ${(p.uncertainty.probability_range*100).toFixed(1)} pp. ${p.uncertainty.answered_specialists} of ${p.uncertainty.eligible_specialists} specialists answered.</p><p>${esc(p.analysis.method)}</p><h3>Matchup interpretation</h3>${(p.analysis.matchup_explanation||[]).map(c=>`<p>${esc(c.text)} <span class="reference">[${c.evidence_refs.map(esc).join(', ')}]</span></p>`).join('')}<h3>Supporting evidence</h3><ul>${claims(p.analysis.evidence)}</ul><h3>Counter-evidence & risks</h3><ul>${claims(p.analysis.counter_evidence)}${p.analysis.risks.map(r=>`<li>${esc(r)}</li>`).join('')}</ul><h3>Evidence provenance</h3>${p.evidence.map(f=>`<p>${esc(f.label)} · ${esc(f.scope)} · ${esc(f.status)}<br><small>${esc(f.source)} · available ${esc(f.available_at)}${f.sample_size==null?'':' · n='+esc(f.sample_size)}</small></p>`).join('')}<p>Missing: ${esc(p.evidence_quality.missing_domains.join(', ')||'none')}. ${p.evidence_quality.excluded.length} facts excluded by availability/freshness checks.</p></div></details><details><summary>Specialist detail & measured performance</summary><div class="detail-body">${p.specialists.map(a=>`<div class="analyst"><strong>${esc(label(a.analyst))}</strong> · ${pct(a.home_probability)} home win<p>${performance(a)}</p><p>${a.abstention_reason?esc(label(a.abstention_reason)):'Evidence: '+a.evidence_refs.map(esc).join(', ')}</p><small>Risks: ${a.risk_refs.map(esc).join(', ')||'No referenced counter-evidence'} · ${esc(a.version)}</small></div>`).join('')}<p>Featuring requires at least 200 answers, 80% coverage, competitive proper scores and acceptable calibration. Cold starts are not featured.</p></div></details></article>`;
}
root.MLBV2={renderCard,esc};
if(typeof module!=='undefined')module.exports=root.MLBV2;
if(typeof document==='undefined')return;
const query=new URLSearchParams(location.search);let token=query.get('token')||'';
const date=document.getElementById('date');date.value=query.get('date')||new Date().toISOString().slice(0,10);
if(token)history.replaceState(null,'',location.pathname);
document.getElementById('admin').onclick=e=>{e.preventDefault();location.href='/admin?token='+encodeURIComponent(token);};
async function load(){
 const games=document.getElementById('games');games.innerHTML='<p class="empty">Loading forecasts…</p>';
 try{const response=await fetch('/api/v2/predictions?date='+encodeURIComponent(date.value)+'&token='+encodeURIComponent(token),{cache:'no-store',referrerPolicy:'no-referrer'});
 if(!response.ok)throw Error(response.status===401?'Authentication required. Open V2 with your existing report token.':'Forecast service unavailable.');
 const data=await response.json();document.getElementById('summary').textContent=data.predictions.length+' games · '+date.value+' · frozen pregame snapshots';
 games.innerHTML=data.predictions.length?data.predictions.map(renderCard).join(''):'<p class="empty">No verified forecasts for this date.<br><small>Missing historical evidence is never replaced with today’s statistics.</small></p>';
 }catch(error){games.innerHTML='<p class="empty">'+esc(error.message)+'</p>';}
}
document.getElementById('browse').onsubmit=e=>{e.preventDefault();load();};load();
})(typeof window==='undefined'?globalThis:window);
