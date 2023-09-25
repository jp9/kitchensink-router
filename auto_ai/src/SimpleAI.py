import pandas as pd
import numpy as np
# from pycaret.regression import *
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import Pipeline


class SimpleAI:
    def __init__(self) -> None:
        pass

    ###########################################################################
    #
    # WARNING: Models are highly data and context dependent, you have to understand why you would want to use a certain
    # algorithm for a model. In this case, we know that cosine function is a polynomial function hence we are using it.
    # Generally higher order polynomial features leads to overfitting and should be avoided.
    #
    ###########################################################################
    def train_linear(self, x, y):
        x = np.asarray(x)
        x.shape = (len(x), 1)
        y = np.array(y)
        model = Pipeline([('poly', PolynomialFeatures(degree=14)),
                          ('linear', LinearRegression(fit_intercept=False))])
        # fit to an order-14 polynomial data
        model = model.fit(x, y)
        self.model = model
        return model

    ###########################################################################
    #
    # Highly simplistic, we are using pycaret to figure out the best fit
    # algorithm. 
    #
    # Commented out for now. 
    ###########################################################################
    # def train_pycaret(self, data):
    #     train_df = pd.DataFrame(np.array(data), columns=["input", "output"])
    #     s = setup(train_df, target="output", session_id = 2)
    #     best = compare_models()
    #     self.model = best
    #     return best

    def predict_single(self, input):
        print("input to predict", input)
        out_df = self.model.predict([[input]])
        print("output", out_df)
        return out_df[0]
