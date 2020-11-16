import type { NonEmptyArray } from "@effect-ts/core/Classic/NonEmptyArray"
import * as T from "@effect-ts/core/Effect"
import * as L from "@effect-ts/core/Effect/Layer"
import * as Ref from "@effect-ts/core/Effect/Ref"
import { pipe } from "@effect-ts/core/Function"
import { tag } from "@effect-ts/core/Has"
import type { _A } from "@effect-ts/core/Utils"

import type { Orientation } from "../domain/Orientation"
import type { Position } from "../domain/Position"
import { validatePosition } from "../domain/Position"
import { InvalidInitialPosition, Rover } from "../domain/Rover"
import { parseInitialPosition } from "../serde/ParseInitialPosition"
import { AppConfig } from "./AppConfig"

export interface RoverState {
  rover: Rover
  history: NonEmptyArray<RoverHistoricPosition>
}

export class RoverHistoricPosition {
  readonly _tag = "HistoryEntry"
  constructor(readonly position: Position, readonly orientation: Orientation) {}
}

export const makeRoverContext = T.gen(function* (_) {
  const { initial } = yield* _(AppConfig)
  const { orientation, position } = yield* _(parseInitialPosition(initial))

  const rover = yield* _(
    pipe(
      validatePosition(position),
      T.map((position) => new Rover(position, orientation)),
      T.catchAll((hit) => T.fail(new InvalidInitialPosition(hit)))
    )
  )

  const ref = yield* _(
    Ref.makeRef<RoverState>({
      rover,
      history: [new RoverHistoricPosition(rover.position, rover.orientation)]
    })
  )

  const getCurrentState = ref.get

  const setCurrentState = ref.set

  const updateCurrentState = (f: (_: RoverState) => RoverState) => Ref.update(f)(ref)

  const actualize = updateCurrentState((self) => ({
    history: [self.history[self.history.length - 1]],
    rover: self.rover
  }))

  return {
    getCurrentState,
    setCurrentState,
    updateCurrentState,
    actualize
  }
})

export interface RoverContext extends _A<typeof makeRoverContext> {}
export const RoverContext = tag<RoverContext>()

export const LiveRoverContext = L.fromEffect(RoverContext)(makeRoverContext)
