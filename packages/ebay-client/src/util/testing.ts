/**
 * Casts the specified function so that the type matches a @see jest.MockedFunction so you can inspect mock.calls.count, etc..
 * It only changes the type. It returns the function as is.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const asMockedFunction = <T extends (...args: any[]) => any>(
  fn: T,
): jest.MockedFunction<T> => fn as jest.MockedFunction<T>
