// Constants

const messagesMaxCharacters = 20000

// Prune Messages Function

export async function pruneMessages(messages) {
  let currentSize = 0
  const newMessages = [];

  for (let i = messages.length - 1; i >= 0; i--) {
    const messageItem = messages[i];
    const message = `${messageItem?.name}: ${messageItem?.message}`;

    currentSize += message.length

    // Add up to N characters.
    if (currentSize < messagesMaxCharacters) newMessages.push(message)
    else break
  }

  // Reverse the array so that the newest messages are first.
  newMessages.reverse()

  return newMessages
}
