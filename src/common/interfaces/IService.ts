export interface IService<Input, Output> {
  execute (input: Input): Promise<Output>;
}
