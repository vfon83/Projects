package application;
public class DecimalConverter extends Converter
{

	//Constructor that sets the base to decimal;
	public DecimalConverter()
	{
		super();  //Call the constructor of the parent class (Converter)
		setBase(DECIMAL);
	}

	//Override conversion method to store the (decimalValue) in binary/octal/hexadecimal inside (outputArray)
	@Override
	void convertToBase(int decimalValue, int[] outputArray)
	{
		char hexaLetter;
		outputArray[0] = Integer.parseInt(Integer.toBinaryString(decimalValue));
		outputArray[1] = Integer.parseInt(Integer.toOctalString(decimalValue));

		hexaLetter = (char) (Integer.toHexString(decimalValue).charAt(0));		//Only works for Hexadecimal values of size 1 (passed as a char datatype)

		outputArray[2] = Character.toUpperCase(hexaLetter);
	}
}