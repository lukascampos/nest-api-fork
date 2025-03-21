export interface IController<Input, Output> {
  handle (input: Input): Promise<Output>;
}
