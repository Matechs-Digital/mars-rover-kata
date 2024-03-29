import * as A from "@effect-ts/core/Classic/Array"
import * as E from "@effect-ts/core/Classic/Either"
import { flow, pipe } from "@effect-ts/core/Function"

import type { Command } from "../app/Command"
import { Commands } from "../app/Command"

export class ParseCommandError {
  readonly _tag = "ParseCommandError"
  constructor(readonly actual: string) {}
}

export const commandRegex = /^(F|B|L|R)$/

export function parseCommand(
  commandString: string
): E.Either<ParseCommandError, Command> {
  const results = commandRegex.exec(commandString)

  if (results == null) {
    return E.left(new ParseCommandError(commandString))
  }

  const command = results[1]

  switch (command) {
    case "F": {
      return E.right(Commands.Forward)
    }
    case "B": {
      return E.right(Commands.Backward)
    }
    case "L": {
      return E.right(Commands.Left)
    }
    case "R": {
      return E.right(Commands.Right)
    }
    default: {
      throw new Error("absurd")
    }
  }
}

export function parseCommands(obstaclesConfig: string) {
  if (obstaclesConfig.length === 0) {
    return E.right([])
  }
  return pipe(
    obstaclesConfig.split(","),
    A.foreachF(E.Applicative)(flow((s) => s.trim(), parseCommand))
  )
}
