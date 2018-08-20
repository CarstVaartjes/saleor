import datetime as dt

vacation_list = \
    [dt.date(2018, 8, 20) + dt.timedelta(days=x) for x in range(0, 52 * 28)]
