// Explicit operator entry point; never invoked by Club or during builds/tests.
import {createRunner} from "./server.mjs";
const required=name=>{if(!process.env[name])throw new Error(`${name} is required`);return process.env[name];};
const runner=await createRunner({image:required("LAB_IMAGE"),key:required("LAB_TLS_KEY"),cert:required("LAB_TLS_CERT"),ca:required("LAB_TLS_CA")});
runner.server.listen(Number(process.env.LAB_PORT??9443),required("LAB_BIND"));
for(const sig of ["SIGINT","SIGTERM"])process.on(sig,()=>void runner.close().then(()=>process.exit(0)));
