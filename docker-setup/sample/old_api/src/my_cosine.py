##############################################################################
#
# Class to calculate cosine values using polynomial function
#
##############################################################################

import math

TOLERANCE = 0.01


class MyCosine:
    @staticmethod
    def factorial(n):
        output = 1
        for i in range(2, n+1):
            output = output*i
        # print("Factorial of "+str(n)+" is : "+str(output), flush=True)
        return output

    @staticmethod
    def polynomial_term(rad, n):
        # print("Factorial of term is: "+str(pow(rad, n)/MyCosine.factorial(n)), flush=True)
        return pow(rad, n)/MyCosine.factorial(n)

    @staticmethod
    def consine_value(radian):
        # Simplistic calculation
        # using only the first few polynomial terms of the power series expansion
        # WARNING: This is a POOR implementation, meant for demonstration purpose only..
        rad = radian % (2.0*math.pi)
        return (1 - MyCosine.polynomial_term(rad, 2) + MyCosine.polynomial_term(rad, 4)
                - MyCosine.polynomial_term(rad, 6) +
                MyCosine.polynomial_term(rad, 8)
                - MyCosine.polynomial_term(rad, 10) +
                MyCosine.polynomial_term(rad, 12)
                - MyCosine.polynomial_term(rad, 14) +
                MyCosine.polynomial_term(rad, 16)
                - MyCosine.polynomial_term(rad, 18)
                )


if __name__ == '__main__':
    ######################
    # Testing the values.
    ######################
    for i in range(0, 700, 10):
        if abs(MyCosine.consine_value(i/100.0) - math.cos(i/100.0)) > TOLERANCE:
            print("Tolerance exceeded. Cosine of: ", i/100.0,
                  MyCosine.consine_value(i/100.0), math.cos(i/100.0))
