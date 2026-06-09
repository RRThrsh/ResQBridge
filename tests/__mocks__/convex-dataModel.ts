export type Doc<TableName extends string> = Record<string, unknown> & { _id: Id<TableName> }
export type Id<TableName extends string> = string & { __tableName: TableName }
export type TableNames = string
export type DataModel = Record<string, unknown>
