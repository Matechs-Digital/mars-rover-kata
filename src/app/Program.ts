import * as NA from "@effect-ts/core/Classic/NonEmptyArray"
import * as O from "@effect-ts/core/Classic/Option"
import * as T from "@effect-ts/core/Effect"
import { pipe } from "@effect-ts/core/Function"

import * as I from "../common/Int"
import { Orientation } from "../domain/Orientation"
import type { Position } from "../domain/Position"
import { validatePosition } from "../domain/Position"
import { Rover } from "../domain/Rover"
import { parseCommands } from "../serde/CommandParser"
import * as C from "./Command"
import { Console } from "./Console"
import { ReadLine } from "./ReadLine"
import { prettyObstacle, prettyPosition } from "./Render"
import { RoverContext, RoverHistoricPosition } from "./RoverContext"

export class NextPositionObstacle {
  readonly _tag = "NextPositionObstacle"
  constructor(readonly position: Position, readonly orientation: Orientation) {}
}

export function nextPosition(x: I.Int, y: I.Int, orientation: Orientation) {
  return T.gen(function* (_) {
    const { updateCurrentState } = yield* _(RoverContext)

    return yield* _(
      pipe(
        validatePosition({ x, y }),
        T.chain((position) =>
          updateCurrentState(({ history }) => ({
            rover: new Rover(position, orientation),
            history: NA.snoc(new RoverHistoricPosition(position, orientation))(history)
          }))
        ),
        T.catchAll((e) => T.fail(new NextPositionObstacle(e.position, orientation)))
      )
    )
  })
}

export const move = (command: C.Command) =>
  pipe(
    command,
    T.matchTag({
      GoForward,
      GoBackward,
      GoLeft,
      GoRight
    })
  )

export function GoForward(_: C.GoForward) {
  return T.gen(function* (_) {
    const { getCurrentState } = yield* _(RoverContext)

    return yield* _(
      pipe(
        getCurrentState,
        T.chain((state) =>
          pipe(
            state.rover.orientation,
            T.matchTag({
              North: () =>
                nextPosition(
                  state.rover.position.x,
                  I.increment(state.rover.position.y),
                  Orientation.North
                ),
              South: () =>
                nextPosition(
                  state.rover.position.x,
                  I.decrement(state.rover.position.y),
                  Orientation.South
                ),
              East: () =>
                nextPosition(
                  I.increment(state.rover.position.x),
                  state.rover.position.y,
                  Orientation.East
                ),
              West: () =>
                nextPosition(
                  I.decrement(state.rover.position.x),
                  state.rover.position.y,
                  Orientation.West
                )
            })
          )
        )
      )
    )
  })
}

export function GoBackward(_: C.GoBackward) {
  return T.gen(function* (_) {
    const { getCurrentState } = yield* _(RoverContext)

    return yield* _(
      pipe(
        getCurrentState,
        T.chain((state) =>
          pipe(
            state.rover.orientation,
            T.matchTag({
              North: () =>
                nextPosition(
                  state.rover.position.x,
                  I.decrement(state.rover.position.y),
                  Orientation.South
                ),
              South: () =>
                nextPosition(
                  state.rover.position.x,
                  I.increment(state.rover.position.y),
                  Orientation.North
                ),
              East: () =>
                nextPosition(
                  I.decrement(state.rover.position.x),
                  state.rover.position.y,
                  Orientation.West
                ),
              West: () =>
                nextPosition(
                  I.increment(state.rover.position.x),
                  state.rover.position.y,
                  Orientation.East
                )
            })
          )
        )
      )
    )
  })
}

export function GoLeft(_: C.GoLeft) {
  return T.gen(function* (_) {
    const { getCurrentState } = yield* _(RoverContext)

    return yield* _(
      pipe(
        getCurrentState,
        T.chain((state) =>
          pipe(
            state.rover.orientation,
            T.matchTag({
              North: () =>
                nextPosition(
                  I.decrement(state.rover.position.x),
                  state.rover.position.y,
                  Orientation.West
                ),
              South: () =>
                nextPosition(
                  I.increment(state.rover.position.x),
                  state.rover.position.y,
                  Orientation.East
                ),
              East: () =>
                nextPosition(
                  state.rover.position.x,
                  I.increment(state.rover.position.y),
                  Orientation.North
                ),
              West: () =>
                nextPosition(
                  state.rover.position.x,
                  I.decrement(state.rover.position.y),
                  Orientation.South
                )
            })
          )
        )
      )
    )
  })
}

export function GoRight(_: C.GoRight) {
  return T.gen(function* (_) {
    const { getCurrentState } = yield* _(RoverContext)

    return yield* _(
      pipe(
        getCurrentState,
        T.chain((state) =>
          pipe(
            state.rover.orientation,
            T.matchTag({
              North: () =>
                nextPosition(
                  I.increment(state.rover.position.x),
                  state.rover.position.y,
                  Orientation.East
                ),
              South: () =>
                nextPosition(
                  I.decrement(state.rover.position.x),
                  state.rover.position.y,
                  Orientation.West
                ),
              East: () =>
                nextPosition(
                  state.rover.position.x,
                  I.decrement(state.rover.position.y),
                  Orientation.South
                ),
              West: () =>
                nextPosition(
                  state.rover.position.x,
                  I.increment(state.rover.position.y),
                  Orientation.North
                )
            })
          )
        )
      )
    )
  })
}

export const moveRight = move(C.Commands.Right)

export const moveLeft = move(C.Commands.Left)

export const moveForward = move(C.Commands.Forward)

export const moveBackward = move(C.Commands.Backward)

export const main = pipe(
  T.gen(function* (_) {
    const { getStrLn } = yield* _(ReadLine)
    const { error, log } = yield* _(Console)
    const { actualize, getCurrentState } = yield* _(RoverContext)
    const commandsInput = yield* _(getStrLn)

    if (commandsInput.length === 0) {
      return O.some("stop")
    }

    const commands = yield* _(parseCommands(commandsInput))

    return yield* _(
      pipe(
        commands,
        T.foreach(move),
        T.andThen(getCurrentState),
        T.chain(({ history }) =>
          pipe(
            history,
            T.foreach(({ orientation, position }) =>
              log(prettyPosition(position, orientation))
            )
          )
        ),
        T.andThen(actualize),
        T.as(O.none),
        T.catchAll((e) =>
          pipe(
            getCurrentState,
            T.chain(({ history }) =>
              pipe(
                history,
                T.foreach(({ orientation, position }) =>
                  log(prettyPosition(position, orientation))
                )
              )
            ),
            T.andThen(error(prettyObstacle(e))),
            T.andThen(actualize),
            T.as(O.none)
          )
        )
      )
    )
  }),
  T.repeatUntil(O.isSome)
)
