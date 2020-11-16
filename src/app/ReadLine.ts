import * as T from "@effect-ts/core/Effect"
import * as L from "@effect-ts/core/Effect/Layer"
import { tag } from "@effect-ts/core/Has"
import type { _A } from "@effect-ts/core/Utils"
import { createInterface } from "readline"

export const makeReadLine = T.succeed({
  getStrLn: T.effectAsyncInterrupt<unknown, never, string>((cb) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    })
    rl.question("> ", (answer) => {
      rl.close()
      cb(T.succeed(answer))
    })
    return T.effectTotal(() => {
      rl.close()
    })
  })
})

export interface ReadLine extends _A<typeof makeReadLine> {}

export const ReadLine = tag<ReadLine>()

export const LiveReadLine = L.fromEffect(ReadLine)(makeReadLine)
