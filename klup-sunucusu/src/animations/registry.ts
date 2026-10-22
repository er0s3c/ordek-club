import type { AnimationDef } from "./types";
import { dnsResolution, firewallDecision, httpRequest, networkTopology, packetJourney, tcpHandshake, vpnTunnel } from "./network";
import { authentication, mitm, phishing, sqlInjection, tlsHandshake, xssFlow } from "./web";
import { passwordStorage, socAlert } from "./ops";

export const ANIMATIONS: readonly AnimationDef[] = [
  httpRequest, dnsResolution, tcpHandshake, tlsHandshake, authentication, sqlInjection, xssFlow, phishing,
  packetJourney, firewallDecision, vpnTunnel, mitm, passwordStorage, networkTopology, socAlert,
];

const byId = new Map(ANIMATIONS.map((a) => [a.id, a]));

export const ANIMATION_IDS = ANIMATIONS.map((a) => a.id) as [string, ...string[]];
export const getAnimation = (id: string): AnimationDef | undefined => byId.get(id);
