// Pure launch policy. This file does not start Docker or delete containers.
export const CAPACITY = 20;
export const TTL_MS = 30 * 60_000;
export const IDLE_MS = 10 * 60_000;
export function validateImage(image) {
  if (!/^(?:[a-z0-9][a-z0-9./:_-]*@)?sha256:[a-f0-9]{64}$/.test(image ?? "")) throw new Error("LAB_IMAGE must be an immutable image digest");
  return image;
}
export function containerArgs(name, image, instance) {
  if (!/^ordek-lab-[a-f0-9-]{36}$/.test(name) || !/^[a-f0-9-]{36}$/.test(instance)) throw new Error("Invalid session identity");
  return ["run","--detach","--pull=never","--name",name,"--label",`ordek.club.instance=${instance}`,"--runtime=runsc","--network=none","--read-only","--cap-drop=ALL","--security-opt=no-new-privileges","--user=1000:1000","--cpus=1","--memory=512m","--memory-swap=512m","--pids-limit=128","--tmpfs","/tmp:rw,nosuid,nodev,noexec,size=16m,uid=1000,gid=1000","--tmpfs","/home/student:rw,nosuid,nodev,noexec,size=64m,uid=1000,gid=1000","--log-driver=none",validateImage(image)];
}
export function mayRemoveContainer(session, inspected, instance) {
  return !!session && /^ordek-lab-[a-f0-9-]{36}$/.test(session.name) && inspected.Name === `/${session.name}` && inspected.Id === session.containerId && inspected.Config?.Labels?.["ordek.club.instance"] === instance;
}
export function expired(session, now) { return now-session.createdAt>=TTL_MS || now-session.lastInput>=IDLE_MS; }
// A timed-out Docker response may still have created a container. Reserve that
// slot until the exact session has been reconciled; never overbook on uncertainty.
export function reservedSlots(sessions) { return [...sessions].filter(s => s.state === "RUNNING" || s.state === "FAILED").length; }
