
#diff -Bw --side-by-side	 --suppress-common-lines  case21_solid/react-core/src/components/Cell.tsx  case21/react-core/src/components/Cell.tsx
#diff -r -Bw --side-by-side	  case21_solid/react-core/src/components/Cell.tsx  case21/react-core/src/components/Cell.tsx
#diff -Bwu  case21_solid/react-core/src/components/Cell.tsx  case21/react-core/src/components/Cell.tsx

#S1=case21_solid/react-core/src/components/Cell.tsx
#S2=case21/react-core/src/components/Cell.tsx
#diff -r -Bw --side-by-side $S1 $S2

# https://itpfdoc.hitachi.co.jp/manuals/3021/30213b3220/0366.HTM


D1=case21_solid/react-core/src/components
D2=case21/react-core/src/components
F=Cell.tsx
F=$1

#diff -r -Bw --side-by-side $D1/$F $D2/$F
echo $D2/$F "              " $D1/$F
diff -r -Bw --side-by-side $D2/$F $D1/$F



