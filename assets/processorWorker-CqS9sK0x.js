(function(){"use strict";onmessage=d=>{const n=d.data.data,l=d.data.lookupTable,o={networkToAdd:[],lookupTable:l,memberToAdd:[],generatedData:JSON.parse(d.data.generatedData),a:d.data.a};n.organizations.forEach(a=>{o.generatedData.organizations.push(a),o.networkToAdd.push({type:"node",data:{id:o.a,label:a.o,color:"#0644F1"}});const e=a.DN.split(":")[0],s=o.a;l[e+",OU=CHCommunity,DC=CPI,O=BAG,C=ch"]||(o.a++,o.networkToAdd.push({type:"node",data:{id:o.a,label:e,shape:"box",color:"#f0003c"}}),o.networkToAdd.push({type:"edge",data:{to:-1,from:o.a,length:400}}),o.lookupTable[e+",OU=CHCommunity,DC=CPI,O=BAG,C=ch"]=o.a),o.lookupTable[a.DN]=s,a.businessCategory.match(/264358009|288565001|Hospital|35971002/i)&&o.networkToAdd.push({type:"edge",data:{to:o.lookupTable[e+",OU=CHCommunity,DC=CPI,O=BAG,C=ch"],from:s,length:400}}),o.a++}),n.professionals.forEach(a=>{o.generatedData.professionals.push(a),o.networkToAdd.push({type:"node",data:{id:o.a,label:a.displayName,color:"#0399AC"}}),o.lookupTable[a.DN]=o.a,o.a++}),n.relationships.forEach(a=>{let e=o.generatedData.organizations.find(t=>t.DN===a.owner);e||(e=o.generatedData.professionals.find(t=>t.DN===a.owner));const s=a.member.split(";");e&&s.forEach(t=>{o.memberToAdd.push({o:e,m:t});const r=o.lookupTable[t],p=o.lookupTable[a.owner];p&&r&&o.networkToAdd.push({type:"edge",data:{to:p,from:r,length:200}})})}),postMessage(o)}})();
