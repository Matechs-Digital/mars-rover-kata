import * as T from "@effect-ts/core/Effect"
import * as L from "@effect-ts/core/Effect/Layer"
import { tag } from "@effect-ts/core/Has"
import type { _A } from "@effect-ts/core/Utils"

export const makeConsole = T.succeed({
  log: (message: string) =>
    T.effectTotal(() => {
      console.log(message)
    }),
  error: (message: string) =>
    T.effectTotal(() => {
      console.error(message)
    })
})

export interface Console extends _A<typeof makeConsole> {}

export const Console = tag<Console>()

export const LiveConsole = L.fromEffect(Console)(makeConsole)
