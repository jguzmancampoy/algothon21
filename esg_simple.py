from algothon2021esg import EsgChallenge
import pandas as pd
import numpy as np

validate_path = 'esg_validate_features.csv'
test_path = 'esg_test_features.csv'


class MyEsgChallenge(EsgChallenge):
    def __init__(self, **parms):
        super(MyEsgChallenge, self).__init__(**parms)

    def predict(self, data):
        self.StockIDs = data[data.columns.get_level_values(0)[-1]].columns
        self.nStocks = len(self.StockIDs)

        weights = np.zeros(self.nStocks)
        for i, stock in enumerate(self.StockIDs):
            if data['esg_filter'][stock].values[0] and data['inclusion_in_sp500'][stock].values[0]:
                weights[i] = 1
        weights /= sum(weights)
        return weights

Model = MyEsgChallenge(validate_features=validate_path,test_features=test_path)


validate = Model.run_validate()

test = Model.run_test()

validate.to_csv('team_alpha_hunters_validation_esg.csv')
test.to_csv('team_alpha_hunters_test_esg.csv')
