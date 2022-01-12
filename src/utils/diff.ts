import { Diff, diff_match_patch as DiffMatchPatch } from 'diff-match-patch'
import { ITagTable } from '../types/ITagTable'
import { isHTML } from './isHTML'
import { replaceTags } from './replaceTags'

export const diff_html = (
  previous: string,
  next: string
): Diff[] | undefined => {
  if (!isHTML(previous) || !isHTML(next)) {
    return
  }

  let tagTable: ITagTable[] = []

  const dmp = new DiffMatchPatch()

  let previousEdited = replaceTags(previous, tagTable)
  let nextEdited = replaceTags(next, tagTable)

  const diff = dmp.diff_main(previousEdited, nextEdited)

  diff.forEach((elem, index) => {
    // correction for missing parantheses
    if (
      index < diff.length - 1 &&
      diff[index + 1][1].substring(0, 4) === '}}{{'
    ) {
      diff[index][1] += '}}'
      diff[index + 1][1] = diff[index + 1][1].slice(2)
    }

    // transform back to tags
    tagTable.forEach((tag) => {
      if (elem[1].includes(`{{${tag.id}}}`)) {
        // TODO: needs replaceAll
        elem[1] = elem[1].replace(`{{${tag.id}}}`, tag.htmlElement)
      }

      if (elem[1].includes(`{{/${tag.id}}}`)) {
        // TODO: needs replaceAll
        elem[1] = elem[1].replace(
          `{{/${tag.id}}}`,
          `</${tag.htmlElement.slice(1, -1)}>`
        )
      }
    })
  })

  return diff
}
