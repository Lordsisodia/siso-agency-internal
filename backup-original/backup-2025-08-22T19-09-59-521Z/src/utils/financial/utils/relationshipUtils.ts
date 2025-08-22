
/**
 * Helper utility to check if a relationship object from the database is valid
 * This helps prevent errors when accessing properties of potentially null relationships
 */
export function isValidRelationship(relation: any): boolean {
  return relation !== null && 
         relation !== undefined && 
         typeof relation === 'object' && 
         'id' in relation;
}

/**
 * Creates standardized client data object from raw data
 * Ensures consistent shape for client data regardless of source
 */
export function createClientData(clientData: any) {
  if (!isValidRelationship(clientData)) {
    return undefined;
  }

  // Return client with basic properties
  return {
    id: clientData.id,
    name: clientData.name || clientData.company_name || 'Unknown',
    // Add other essential client properties with fallbacks
    email: clientData.email || '',
    phone: clientData.phone || '',
  };
}

/**
 * Generic function to transform an array of entities using a provided transformer function
 * Helps break deep type instantiation chains
 */
export function transformEntityData<T>(
  data: any[], 
  transformerFn: (item: any) => T
): T[] {
  if (!Array.isArray(data)) {
    console.warn("Invalid data provided to transformEntityData - expected array");
    return [];
  }
  
  return data.map(item => transformerFn(item));
}
