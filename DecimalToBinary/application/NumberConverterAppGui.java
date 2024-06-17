/*
 * Name: Vladimir Fonte
 * Date: 12/03/2023
 * Program: Number Converter Systems version 3
 * Description: A program that can generate random Binary, Octal, or Hexa numbers 
 *				and convert them to Decimal or vice versa using JavaFX GUI.
 */
package application;

import java.lang.NumberFormatException;

//JavaFX imports
import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.stage.Stage;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.RadioButton;
import javafx.scene.control.TextArea;
import javafx.scene.control.TextField;
import javafx.scene.control.Toggle;
import javafx.scene.control.ToggleGroup;
import javafx.scene.layout.VBox;
import javafx.scene.text.Text;


public class NumberConverterAppGui extends Application
{
	@Override
	public void start(Stage primaryStage) 
	{
		//Variables
		int[][] matrix = new int[3][4];
		int[] result = new int[3];

		//Create four instances of the different converters classes
		BinaryConverter binary = new BinaryConverter();
		OctalConverter octal = new OctalConverter();
		HexadecimalConverter hexa = new HexadecimalConverter();
		DecimalConverter decimal = new DecimalConverter();

		//Instantiate the VBox class (vbox) for layout vertical and set it up
		VBox vbox = new VBox(15);
		vbox.setAlignment(Pos.TOP_LEFT);
		vbox.setPadding(new Insets(20));
		vbox.setStyle("-fx-background-color: #CCFFFF");

		//Instantiate a Label class (titleLabel) for the title of the program and edit style
		Label titleLabel = new Label("Number Converter App");
		titleLabel.setStyle("-fx-font-size: 40px;" + 
				"-fx-font-family: 'Times New Roman';" + 
				"-fx-text-fill: #00ccff");


		//Instantiate RadioButtons class to get the choice from the user
		RadioButton binaryOption = new RadioButton("Binary -> Decimal");
		RadioButton octalOption = new RadioButton("Octal -> Decimal");
		RadioButton hexadecimalOption = new RadioButton("Hexadecimal -> Decimal");
		RadioButton decimalOption = new RadioButton("Decimal -> Binary/Octal/Hexa");
		RadioButton quitOption = new RadioButton("Quit");

		//Instantiate the ToggleGroup class (toggleGroup) to only select one RadioButton at a time
		ToggleGroup toggleGroup = new ToggleGroup();

		//Group the RadioButtons under the (toggleGroup) instance
		binaryOption.setToggleGroup(toggleGroup);
		octalOption.setToggleGroup(toggleGroup);
		hexadecimalOption.setToggleGroup(toggleGroup);
		decimalOption.setToggleGroup(toggleGroup);
		quitOption.setToggleGroup(toggleGroup);

		//Instantiate the Button class (selectButton) to select an option from the RadioButtons
		Button selectButton = new Button("Select");

		//Instantiate the TextArea class (displayResults) to display results
		//and set it to be non-editable & adjust size
		TextArea displayResults = new TextArea();
		displayResults.setEditable(false);
		displayResults.setPrefHeight(220);

		//Instantiate the Text class () to prompt the user for input (display only for decimalOption)
		Text decimalPrompt = new Text("Please enter a decimal between 1-15:");

		//Instantiate the TextField class (displayResults) to get the user input (display only for decimalOption)
		TextField decimalInput = new TextField();

		//Instantiate the Button class (decimalConvertButton) to display the results (display only for decimalOption)
		Button decimalConvertButton = new Button("Convert");


		/*
		 * Perform opperations when (selectButton) is clicked
		 * these include
		 * 1. Clearing the (displayResults) if it isn't empty
		 * 2. Removing the (decimalPrompt) and under if it isn't empty to avoid duplicate children
		 * 3. Clearing the (decimalInput) if it isn't empty to refresh the input
		 * 4. If and Else statements after (selectedToggle) is clicked determine which radioButton is selected
		 *	  and display outup accordingly
		 */
		selectButton.setOnAction(clicked -> 
		{
			//Clear the (displayResults) node if is it contains text
			if (displayResults.getText() != null)
				displayResults.clear();

			//Remove the nodes (decimalPrompt) (decimalInput) (decimalConvertButton) if they were previously added to (vbox)
			if (vbox.getChildren().contains(decimalPrompt))
			{
				vbox.getChildren().remove(decimalPrompt);
				vbox.getChildren().remove(decimalInput);
				vbox.getChildren().remove(decimalConvertButton);
			}

			//Clear the (decimalInput) node if is it contains text
			if (decimalInput.getText() != null)
				decimalInput.clear();

			//Opperations performed will depend on the RadioButton selected
			Toggle selectedToggle = toggleGroup.getSelectedToggle();
			if (selectedToggle == binaryOption) 			//Binary
			{
				fillWithRandomValues(matrix, Converter.BINARY);
				binary.convertToBase(matrix, result);
				displayArrays(matrix, result, binary.getBase(), displayResults);
			} 
			else if (selectedToggle	== octalOption)			//Octal
			{
				fillWithRandomValues(matrix, Converter.OCTAL);
				octal.convertToBase(matrix, result);
				displayArrays(matrix, result, octal.getBase(), displayResults);
			} 
			else if (selectedToggle == hexadecimalOption)	//Hexa
			{
				fillWithRandomValues(matrix, Converter.HEXADECIMAL);
				hexa.convertToBase(matrix, result);
				displayArrays(matrix, result, hexa.getBase(), displayResults);
			} 
			else if (selectedToggle == decimalOption)		//Decimal to Binary/Octal/Hexadecimal
			{
				//Prompt the user for input
				vbox.getChildren().add(decimalPrompt);
				vbox.getChildren().add(decimalInput);
				vbox.getChildren().add(decimalConvertButton);

				//Display results if (decimalConvertButton) is clicked
				decimalConvertButton.setOnAction(clicked1 -> 
				{
					//Clear the (displayResults) node if is it contains text
					if (displayResults.getText() != null)
						displayResults.clear();

					//Validate (decimalInput) to be and integer and between 1-15 inclusive
					try
					{
						//Convert and store the string from (decimalInput) inside an int variable (input)
						int input = Integer.parseInt(decimalInput.getText());

						if (input < 1 || input > 15)							//Validate for integers between (1-15) inclusive
						{
							displayResults.appendText("*The number is outside the range 1-15*");
						}
						else
						{
							decimal.convertToBase(input, result);				//If valid input is provided, convert the array and call method (displayArrays)
							displayArrays(matrix, result, decimal.getBase(), displayResults);
						}
					}

					//NumberFormatException caused by the parseInt method (from not integer values)
					catch (NumberFormatException invalid)
					{
						if(decimalInput.getText() == "")						//Display empty-field error if (decimalInput) is empty
						{
							displayResults.appendText("Enter a value to convert");
						}
						else													//Display invalid-integer error if (decimalInput) is not a valid integer
							displayResults.appendText("*Please enter a valid integer value*\n");
					};
				});
			}
			else if (selectedToggle == quitOption)			//Quit
			{
				primaryStage.close();
			}
			else											//No option selected
				displayResults.appendText("Please select an option above");
		});


		//Add nodes to the VBox (vbox)
		vbox.getChildren().add(titleLabel);
		vbox.getChildren().addAll(binaryOption, octalOption, hexadecimalOption, decimalOption, quitOption);
		vbox.getChildren().add(selectButton);
		vbox.getChildren().add(displayResults);

		//Instantiate a scene
		Scene scene = new Scene(vbox, 600, 630);

		//Set up the stage instance
		primaryStage.setTitle("Number Converter Program");
		primaryStage.setScene(scene);
		primaryStage.show();
	}



	public static void main(String[] args) 
	{	
		launch(args);
	}



	//Method to generate random values inside a 2D array (2DArray, minimumValue, maximumValue)
	public static void fillWithRandomValues(int array[][], int max)
	{
		for (int row = 0; row < array.length; row++)
			for (int col = 0; col < array[row].length; col++)
				array[row][col] = (int) (Math.random() * max);
	}

	/*
	 * Method that displays the elements in a 2D array, and a 1DArray (result) at the 
	 * end of each row and store these strings inside a TextArea class instance.
	 * If the base is (DECIMAL), it will be displayed in decimal to Bin/Oct/Hexa instead
	 */
	private static void displayArrays(int twoDimArray[][], int[] oneDimArray, int base, TextArea resultArea)
	{
		if(base == Converter.DECIMAL)	//Display a modified output when the base is in Decimal
		{
			resultArea.appendText("Your decimal value\n" + "in binary/octal/hexa is:\n");
			resultArea.appendText("----------------\n");
			resultArea.appendText("Binary  --->  " + oneDimArray[0] + "\n");
			resultArea.appendText("----------------\n");
			resultArea.appendText("----------------\n");
			resultArea.appendText("Octal  --->  " + oneDimArray[1] + "\n");
			resultArea.appendText("----------------\n");
			resultArea.appendText("----------------\n");												
			resultArea.appendText("Hexa  --->  " + (char) (oneDimArray[2]) + "\n");		//OneDimArray[2] containts the unicode for the hexadecimal conversion
			resultArea.appendText("----------------\n");
		}
		else							//Display regular output for Binary/Octal/Hexadecimal
		{
			resultArea.appendText("\nTwo-Dimensional Array: \n");

			for (int row = 0; row < twoDimArray.length; row++) {
				for (int col = 0; col < twoDimArray[row].length; col++) {
					resultArea.appendText(String.format("%5s", Integer.toHexString(twoDimArray[row][col]).toUpperCase()));

					resultArea.appendText("");


				}
				resultArea.appendText(String.format("%15s  -->  %5s: %5d%n", Converter.getBaseName(base), "Decimal", oneDimArray[row]));
			}
		}
	}
}