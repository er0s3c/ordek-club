"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {api} from "@/lib/api-client";
import { useT } from "@/i18n/client";
export function PortfolioToggle({submissionId,visible}:{submissionId:string;visible:boolean}){
const t = useT();const router=useRouter();const[busy,setBusy]=useState(false),[message,setMessage]=useState("");return <div><button className="btn btn-sm" disabled={busy} onClick={async()=>{setBusy(true);try{await api("/api/learning/portfolio",{method:"PATCH",body:{submissionId,visible:!visible}});router.refresh();}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}}>{visible?t("Portfolyodan gizle"):t("Kulüp üyelerine göster")}</button>{message&&<p role="status">{message}</p>}</div>;}
