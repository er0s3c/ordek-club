import{notFound}from"next/navigation";
import{requirePageSession}from"@/server/auth/page-guard";
import{featureEnabled}from"@/server/learning/features";
import{examState}from"@/server/academy/exams";
import{TrackExam}from"@/components/academy/TrackExam";
export const metadata={title:"Yol sınavı"};
export default async function Page({params}:{params:Promise<{track:string}>}){const{user}=await requirePageSession();if(!await featureEnabled("academy-v2"))notFound();const{track}=await params;if(!/^[a-z0-9-]{1,40}$/.test(track))notFound();return <TrackExam state={await examState({id:user.id,role:user.role,status:user.status},track)}/>;}
