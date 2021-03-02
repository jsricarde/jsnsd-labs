function validateString(sentence) {
  const stack = []

  const startElements = [ '[', '(', '{' ]
  const endElements = [ ']', ')', '}' ]

  for (let letter of sentence) {
    // const start = startElements.findIndex(letter)
    // if (start === -1) {
    //   return false
    // }
    if (startElements.includes(letter)) {
      stack.push(letter)
    } else if (endElements.includes(letter)) {
      stack.pop()
      if (stack.length === 0) {
        return undefined
      }
    }
    return stack.length === 0
  }

}

validateString('(a[0]+b[2c[6]]) {24 + 53}')
