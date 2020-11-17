import * as T from "@effect-ts/core/Effect"
import * as F from "@effect-ts/core/Effect/Fiber"
import * as L from "@effect-ts/core/Effect/Layer"
import { pipe } from "@effect-ts/core/Function"
import { testRuntime } from "@effect-ts/jest/Runtime"
import * as Q from "@effect-ts/system/Queue"

import { LiveAppConfig } from "../src/app/AppConfig"
import { Console } from "../src/app/Console"
import { LivePlanetContext } from "../src/app/PlanetContext"
import { main } from "../src/app/Program"
import { LiveReadFile } from "../src/app/ReadFile"
import { ReadLine } from "../src/app/ReadLine"
import { LiveRoverContext } from "../src/app/RoverContext"

describe("Integration", () => {
  const { it } = pipe(
    LiveRoverContext,
    L.using(LivePlanetContext),
    L.using(LiveAppConfig),
    L.using(LiveReadFile),
    testRuntime
  )

  it("test main program", () =>
    T.gen(function* (_) {
      const input = yield* _(Q.makeUnbounded<string>())
      const output = yield* _(Q.makeUnbounded<string>())

      const fiber = yield* _(
        pipe(
          main,
          T.provideService(ReadLine)({
            getStrLn: Q.take(input)
          }),
          T.provideService(Console)({
            error: (message) => Q.offer_(output, `error: ${message}`),
            log: (message) => Q.offer_(output, `log: ${message}`)
          }),
          T.forkManaged
        )
      )

      yield* _(Q.offer_(input, "F"))

      expect(yield* _(Q.take(output))).toEqual("log: 1:3:N")
      expect(yield* _(Q.take(output))).toEqual("log: 1:0:N")

      yield* _(Q.offer_(input, ""))

      yield* _(F.join(fiber))
    }))
})
