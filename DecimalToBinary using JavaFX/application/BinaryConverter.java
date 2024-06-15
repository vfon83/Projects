package application;
public class BinaryConverter extends Converter
{

	//Constructor that sets the base to Binary;
	public BinaryConverter() 
	{
		setBase(BINARY);
	}

	//Override conversion method to binary
	@Override
	void convertToBase(int[][] inputArray, int[] outputArray)
	{
		for (int row = 0; row < inputArray.length; row++)
		{
			int total = 0;

			for (int col = 0, colLastIndex = inputArray[row].length - 1; col < inputArray[row].length; col++, colLastIndex--)
			{
				total += inputArray[row][col] * Math.pow(getBase(), colLastIndex);
			}

			outputArray[row] = total;
		}
	}
}