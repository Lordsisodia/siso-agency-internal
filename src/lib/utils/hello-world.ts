/**
 * Returns a greeting message
 * @param name - The name to greet
 * @returns A greeting message
 */
export function helloWorld(name: string = 'World'): string {
  return `Hello, ${name}!`;
}

/**
 * Logs a greeting to the console
 * @param name - The name to greet
 */
export function sayHello(name: string = 'World'): void {
  console.log(helloWorld(name));
}
