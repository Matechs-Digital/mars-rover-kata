import * as T from "@effect-ts/core/Effect"
import * as L from "@effect-ts/core/Effect/Layer"
import { tag } from "@effect-ts/core/Has"
import type { _A } from "@effect-ts/core/Utils"
import * as FS from "fs"

export class ReadFileError {
  readonly _tag = "ReadFileError"
  constructor(readonly error: NodeJS.ErrnoException) {}
}

export const makeReadFile = T.succeed({
  read: (file: string) =>
    T.effectAsync<unknown, ReadFileError, string>((cb) => {
      FS.readFile(file, (err, data) => {
        if (err) {
          cb(T.fail(new ReadFileError(err)))
        } else {
          cb(T.succeed(data.toString("utf8")))
        }
      })
    })
})

export interface ReadFile extends _A<typeof makeReadFile> {}

export const ReadFile = tag<ReadFile>()

export const LiveReadFile = L.fromEffect(ReadFile)(makeReadFile)
