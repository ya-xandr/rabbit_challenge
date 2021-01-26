# rabbit_challenge

For service start run:  
```docker-compose -f docker-compose-prod.yml up```


For development start run:  
```docker-compose up```
Service would be exposed with ```http://rabbit-hole.localhost``` domain.

API definition available via ```http://rabbit-hole.localhost/spec``` URL

Request example:
```
curl --location --request POST 'http://rabbit-hole.localhost/api/v1/findAnswers' \
--form 'wordlist=@"/home/serhii/Downloads/wordlist.csv"' \
--form 'anagram="poultry outwits ants"' \
--form 'matches[]="e4820b45d2277f3844eac66c903e84be"' \
--form 'matches[]="23170acc097c24edb98fc5488ab033fe"' \
--form 'matches[]="665e5bcb0c20062fe8abaaf4628bb154"'
```

# Algorithm concept

1. First step is preparing data. 
Initial data contains a lot of words that can't be the part of provided anagram. 
Few reasons:
- Word contains symbols that are not presented in anagram
- Word contains more occurences of character than anagram
This words can be cleared. On this step we can reduce initial 100000 words to 1787

Then we can order wordlist by word length. This allows to get major phrase lenght on the lower depth of recursion. 

2. Getting anagram words sets. Parallel backtracking
To find secret phrases we need to find anagrams of initial anagram that has given MD5 hashes.
Possible algorithmic solution to build set of words that form anagram and then get MD5 hashes from this words permutations to find exact phrases.

To find sets of words that could form anagram lets use recursive backtracking. But to get some performance optimization lets create parallel algorithms where workers would divide solution tree on separate smaller trees. It allows to get to the solutions faster then with a single thread process.

It gives us needed solutions.
```
app-service_1    | [925762475d41]   1/26/2021, 9:24:17 PM   complete phrase for matchIndex 2: wu lisp not statutory 
app-service_1    | [925762475d41]   1/26/2021, 9:24:25 PM   complete phrase for matchIndex 1: ty outlaws printouts 
app-service_1    | [925762475d41]   1/26/2021, 9:25:09 PM   complete phrase for matchIndex 0: printout stout yawls 
app-service_1    | [925762475d41]   1/26/2021, 9:25:13 PM   State: {"0":-1,"1":-1,"2":-1}
app-service_1    | [925762475d41]   1/26/2021, 9:25:13 PM   State: anangram sets produced: 79657, permutations made: 30934956
```

Notes: Since worker threads could allocate different (it's random) then time required to find solution may vary in significant range. There is a possible place to optimize solution. We can use approach similar to Monte Carlo method and run several parallel routine which will gets to the solutions via different solution trees and gets this solution faster than single run.
