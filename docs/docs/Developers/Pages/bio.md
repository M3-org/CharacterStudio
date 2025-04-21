# Bio

This menu is currently hidden, to display it you can use the function `setViewMode` and const `ViewMode` from [ViewContext](../Contexts/view-context.md) import statement, to display this page using`setViewMode(ViewMode.LANDING)` 


**Summary**

The `BioPage` can be a part of a character creation process. It allows users to customize their character's biography, including their name, voice, favorite color, greeting, and a description that can be used to define it's AI personality


**BioPage Component**

The `BioPage` component is a functional component that uses several hooks to manage its state and side effects. It uses the useContext hook to access the necessary contexts, the `useState` hook to manage the character's full biography, and the useEffect hook to update the local storage whenever the biography changes.


**Helper Functions**

There are several helper functions defined in the file:

- `getBio`: This function generates a character's biography based on the base character data and personality.
- `getPersonalityQuestionsAndAnswers`, `getHobbyQuestionsAndAnswers`, `getRelationshipQuestionsAndAnswers`: These functions generate a random question and answer pair from the provided personality data.


**Utils Functions**

- `back` goes back to the previous page.

- `next` goes forward to the next page.


