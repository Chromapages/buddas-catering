/**
 * CRM Service Barrel
 * Re-exports domain services to maintain backward compatibility.
 */

export * from "./base";
export * from "./lead.service";
export * from "./company.service";
export * from "./request.service";
export * from "./approval.service";
export * from "./notification.service";
export * from "./user.service";
export * from "./analytics.service";
export * from "./membership.service";
export * from "./contact.service";

// Note: Re-exporting individual functions is managed by 'export *' 
// if there are no naming collisions.
