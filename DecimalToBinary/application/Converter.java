package application;
public class Converter {

	//Base field
	private int base;

	//Constant base fields
	final static int BINARY = 2;
	final static int OCTAL = 8;
	final static int HEXADECIMAL = 16;
	final static int DECIMAL = 1;	

	//Default constructor
	Converter()
	{
		base = 0;
	}

	//Get the current base
	public int getBase()
	{
		return base;
	}

	//Set the base to another intger
	public void setBase(int base)
	{
		this.base = base;
	}

	//Method to be overridden
	//It that takes a 2DArray, converts it to a decimal, and stores it inside a 1DArray (2DArray, 1DArray)
	void convertToBase(int[][] inputArray, int[] outputArray)
	{
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

	//Method to be overridden
	//Method overload for decimal conversion
	//It takes a decimal value, converts it to binary/octal/hexadecimal and stores it in a 1Darray of size 3
	void convertToBase(int decimalValue, int[] outputArray)
	{
		outputArray[0] = Integer.parseInt(Integer.toBinaryString(decimalValue));
		outputArray[1] = Integer.parseInt(Integer.toOctalString(decimalValue));
		outputArray[2] = Integer.parseInt(Integer.toHexString(decimalValue));
	}

	//Return a string with the name of the current base
	static String getBaseName(int baseChoice)
	{
		switch (baseChoice)
		{
		case BINARY:
			return "Binary";
		case OCTAL:
			return "Octal";
		case HEXADECIMAL:
			return "Hexadecimal";
		default:
			return "Decimal";
		}
	}
}