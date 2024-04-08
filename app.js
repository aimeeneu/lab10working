// npx expo start --web to start
import { StatusBar } from "expo-status-bar"
import { StyleSheet, View } from "react-native"
import { FlatList } from "react-native"
import { Button, ButtonGroup, CheckBox, Input, Text } from "@rneui/themed"
import * as Font from "expo-font"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { useEffect, useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

async function cacheFonts(fonts) {
  return fonts.map(async (font) => await Font.loadAsync(font))
}
const Stack = createNativeStackNavigator()
const sampleData = [
  {
    prompt: "What color is made by mixing yellow and blue?",
    type: "multiple-choice",
    choices: ["Red", "Purple", "Brown", "Green"],
    correct: 3,
  },
  {
    prompt: "What are the primary colors? (Choose all correct answers.)",
    type: "multiple-answer",
    choices: ["Green", "Yellow", "Red", "Blue"],
    correct: [1, 2, 3],
  },
  {
    prompt: "Black is the combination of all colors.",
    type: "true-false",
    choices: ["True", "False"],
    correct: 0,
  },
]

export default function App() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [selectedIndexes, setSelectedIndexes] = useState([])
  const [userChoices, setUserChoices] = useState([])

  const nextQuestion = (navigation, questionNumber, type) => {
    const nextQuestionNumber = questionNumber + 1

    let selectedValue
    if (type !== "multiple-answer") {
      selectedValue = selectedIndex
    } else {
      selectedValue = selectedIndexes.length > 0 ? selectedIndexes : [] // Ensure an empty array if no selections
    }

    setUserChoices([...userChoices, selectedValue])

    if (nextQuestionNumber < sampleData.length) {
      navigation.navigate("Question", { questionNumber: nextQuestionNumber })
    } else {
      navigation.navigate("SummaryScreen", { userChoices, data: sampleData })
    }
  }

  const Question = ({ navigation, route }) => {
    const { questionNumber } = route.params
    const { choices, prompt, type } = sampleData[questionNumber]

    return (
      <View style={styles.container}>
        <Text>{prompt}</Text>
        {type !== "multiple-answer" ? (
          <ButtonGroup
            buttons={choices}
            vertical
            selectedIndex={selectedIndex}
            onPress={(value) => setSelectedIndex(value)}
            containerStyle={styles.buttonGroup}
          />
        ) : (
          <ButtonGroup
            buttons={choices}
            vertical
            selectMultiple
            selectedIndexes={selectedIndexes}
            onPress={(indexes) => setSelectedIndexes(indexes)}
            containerStyle={styles.buttonGroup}
          />
        )}
        <Button
          testID="next-question"
          onPress={() => nextQuestion(navigation, questionNumber, type)}
          title="Next Question"
        />
      </View>
    )
  }

  const SummaryScreen = ({ route }) => {
    console.log("User Choices:", route.params.userChoices) // Troubleshooting
    console.log("Data:", route.params.data) // Troubleshooting
    const { userChoices, data } = route.params

    const calculateCorrect = (userSelected, correct, type) => {
      if (type === "true-false") {
        return userSelected === correct
      } else if (type === "multiple-answer") {
        userSelected = Array.isArray(userSelected)
          ? userSelected
          : [userSelected]

        const allCorrectIncluded = correct.every((index) =>
          userSelected.includes(index)
        )

        const allUserSelectedCorrect =
          userSelected.length === correct.length &&
          userSelected.every((index) => correct.includes(index))

        return allCorrectIncluded && allUserSelectedCorrect
      } else {
        return userSelected === correct
      }
    }

    const totalScore = userChoices.reduce((acc, choice, index) => {
      const { correct, type } = data[index]
      return acc + (calculateCorrect(choice, correct, type) ? 1 : 0)
    }, 0)
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Summary</Text>
        <Text style={styles.score}>
          Score: {totalScore} out of {data.length}
        </Text>
        <FlatList
          data={data}
          renderItem={({ item, index }) => (
            <View style={styles.questionContainer}>
              <Text>{item.prompt}</Text>
              {item.choices.map((choice, choiceIndex) => {
                const userSelected = userChoices[index]
                const isCorrect = calculateCorrect(
                  choiceIndex,
                  item.correct,
                  item.type
                )
                const textDecorationLine = isCorrect ? "none" : "line-through"
                const color =
                  userSelected === choiceIndex && !isCorrect ? "red" : "black"
                const backgroundColor = isCorrect ? "lightgreen" : "transparent"

                return (
                  <CheckBox
                    key={choiceIndex}
                    title={choice}
                    checked={calculateCorrect(
                      choiceIndex,
                      item.correct,
                      item.type
                    )}
                    containerStyle={{
                      backgroundColor,
                    }}
                    textStyle={{
                      textDecorationLine,
                      color,
                    }}
                    disabled
                  />
                )
              })}
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    )
  }
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 10,
    },
    score: {
      fontSize: 18,
      marginBottom: 10,
    },
    buttonGroup: {
      marginBottom: 20,
      width: "70%",
    },
    questionContainer: {
      marginBottom: 20,
    },
  })

  cacheFonts([FontAwesome.font])

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Question">
        <Stack.Screen
          name="Question"
          component={Question}
          initialParams={{ questionNumber: 0 }}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SummaryScreen"
          component={SummaryScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
