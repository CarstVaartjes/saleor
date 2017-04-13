import datetime as dt

vacation_list = \
    [dt.datetime(2017, 4, 21) + dt.timedelta(days=x) for x in range(0, 5)] + \
    [dt.datetime(2017, 5, 6) + dt.timedelta(days=x) for x in range(0, 1)] + \
    [dt.datetime(2017, 6, 30) + dt.timedelta(days=x) for x in range(0, 2)] + \
    [dt.datetime(2017, 8, 11) + dt.timedelta(days=x) for x in range(0, 22)]
