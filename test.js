const json = [
    {
        account: 'BuMY7ysgaH3YnGTaN3D8e1xs7vU1RH6tmiDbXVpSCGWv',
        nativeBalanceChange: 2039280,
        tokenBalanceChanges: [
          {
            mint: 'CG8eafjwbsRvbQ3x3muU5L6EBCMEVXyqigfujzdm2q6P',
            rawTokenAmount: [Object],
            tokenAccount: 'BuMY7ysgaH3YnGTaN3D8e1xs7vU1RH6tmiDbXVpSCGWv',
            userAccount: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1'
          }
        ]
      },
      {
        account: '4a17ynUVmwJ4No1FrsBwETiwSvVnYVpVBRhASqBukxGf',
        nativeBalanceChange: 30002039280,
        tokenBalanceChanges: [
          {
            mint: 'So11111111111111111111111111111111111111112',
            rawTokenAmount: [Object],
            tokenAccount: '4a17ynUVmwJ4No1FrsBwETiwSvVnYVpVBRhASqBukxGf',
            userAccount: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1'
          }
        ]
      },
      {
        account: '7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5',
        nativeBalanceChange: 400000000,
        tokenBalanceChanges: [
          {
            mint: 'So11111111111111111111111111111111111111112',
            rawTokenAmount: [Object],
            tokenAccount: '7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5',
            userAccount: 'GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ'
          }
        ]
      },
      {
        account: '6QMc9FJfLnukho2nSC3w7ComdD4tesG7iCcYLGmymAug',
        nativeBalanceChange: 0,
        tokenBalanceChanges: [
          {
            mint: 'CG8eafjwbsRvbQ3x3muU5L6EBCMEVXyqigfujzdm2q6P',
            rawTokenAmount: [Object],
            tokenAccount: '6QMc9FJfLnukho2nSC3w7ComdD4tesG7iCcYLGmymAug',
            userAccount: 'H2xwzyRzntF1Vm9uAsDMZC2UJsbGRbu7C5KUFEeUT5LG'
          }
        ]
      },
      {
        account: '27Nsps2U97iDFtgNT1kDJ8gkpXpQ6YjsCTbx4aipSxHy',
        nativeBalanceChange: 2039280,
        tokenBalanceChanges: [
          {
            mint: 'EuMEjN8AGUK4rNGY3haSaDELQ9amC9AcSNthF9mo93DZ',
            rawTokenAmount: [Object],
            tokenAccount: '27Nsps2U97iDFtgNT1kDJ8gkpXpQ6YjsCTbx4aipSxHy',
            userAccount: 'H2xwzyRzntF1Vm9uAsDMZC2UJsbGRbu7C5KUFEeUT5LG'
          }
        ]
      }
  ];
  

  const extractMintIds = (item) => {

  // Loop through each item in the array
  item.forEach((item, index) => {
    // Assign an index to each item
    item.index = index;

    // Assuming you want to do something with each item's mintIds here
    item.tokenBalanceChanges.forEach(change => {
      // Example action: log mint IDs and their corresponding index
      if(change.mint == 'So11111111111111111111111111111111111111112' && item.nativeBalanceChange != '400000000')
      console.log(`Index: ${index}, Mint: ${change.mint}, account: ${item.account}`);
    });
  });


  }

  //extractMintIds(json);