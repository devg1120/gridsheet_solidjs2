
#diff -Bw --side-by-side	 --suppress-common-lines  case21_solid/react-core/src/components/Cell.tsx  case21/react-core/src/components/Cell.tsx
#diff -r -Bw --side-by-side	  case21_solid/react-core/src/components/Cell.tsx  case21/react-core/src/components/Cell.tsx
#diff -Bwu  case21_solid/react-core/src/components/Cell.tsx  case21/react-core/src/components/Cell.tsx

#S1=case21_solid/react-core/src/components/Cell.tsx
#S2=case21/react-core/src/components/Cell.tsx
#diff -r -Bw --side-by-side $S1 $S2

# https://itpfdoc.hitachi.co.jp/manuals/3021/30213b3220/0366.HTM
# Reset
NC='\033[0m'       # Text Reset
# Regular Colors
BLACK='\033[0;30m'        # BLACK
RED='\033[0;31m'          # RED
GREEN='\033[0;32m'        # GREEN
YELLOW='\033[0;33m'       # YELLOW
BLUE='\033[0;34m'         # BLUE
PURPLE='\033[0;35m'       # PURPLE
CYAN='\033[0;36m'         # CYAN
WHITE='\033[0;37m'        # WHITE
# Bold
BBLACK='\033[1;30m'       # BLACK
BRED='\033[1;31m'         # RED
BGREEN='\033[1;32m'       # GREEN
BYELLOW='\033[1;33m'      # YELLOW
BBLUE='\033[1;34m'        # BLUE
BPURPLE='\033[1;35m'      # PURPLE
BCYAN='\033[1;36m'        # CYAN
BWHITE='\033[1;37m'       # WHITE
# Underline
UBLACK='\033[4;30m'       # BLACK
URED='\033[4;31m'         # RED
UGREEN='\033[4;32m'       # GREEN
UYELLOW='\033[4;33m'      # YELLOW
UBLUE='\033[4;34m'        # BLUE
UPURPLE='\033[4;35m'      # PURPLE
UCYAN='\033[4;36m'        # CYAN
UWHITE='\033[4;37m'       # WHITE
# Background
BGBLACK='\033[40m'       # BLACK
BGRED='\033[41m'         # RED
BGGREEN='\033[42m'       # GREEN
BGYELLOW='\033[43m'      # YELLOW
BGBLUE='\033[44m'        # BLUE
BGPURPLE='\033[45m'      # PURPLE
BGCYAN='\033[46m'        # CYAN
BGWHITE='\033[47m'       # WHITE
# High Intensity
HIBLACK='\033[0;90m'       # BLACK
HIRED='\033[0;91m'         # RED
HIGREEN='\033[0;92m'       # GREEN
HIYELLOW='\033[0;93m'      # YELLOW
HIBLUE='\033[0;94m'        # BLUE
HIPURPLE='\033[0;95m'      # PURPLE
HICYAN='\033[0;96m'        # CYAN
HIWHITE='\033[0;97m'       # WHITE
# Bold High Intensity
BIBLACK='\033[1;90m'      # BLACK
BIRED='\033[1;91m'        # RED
BIGREEN='\033[1;92m'      # GREEN
BIYELLOW='\033[1;93m'     # YELLOW
BIBLUE='\033[1;94m'       # BLUE
BIPURPLE='\033[1;95m'     # PURPLE
BICYAN='\033[1;96m'       # CYAN
BIWHITE='\033[1;97m'      # WHITE
# High Intensity backgrounds
BGHIBLACK='\033[0;100m'   # BLACK
BGHIRED='\033[0;101m'     # RED
BGHIGREEN='\033[0;102m'   # GREEN
BGHIYELLOW='\033[0;103m'  # YELLOW
BGHIBLUE='\033[0;104m'    # BLUE
BGHIPURPLE='\033[0;105m'  # PURPLE
BGHICYAN='\033[0;106m'    # CYAN
BGHIWHITE='\033[0;107m'   # WHITE

## 使い方:
# echo -e "${CYAN}This color is cyan!${NC}"


D1=case21_solid/react-core/src/components
D2=case21/react-core/src/components
F=Cell.tsx
F=$1

#diff -r -Bw --side-by-side $D1/$F $D2/$F

#(echo $D2/$F "                     " $D1/$F
#diff -r -Bw --side-by-side $D2/$F $D1/$F) | less


#(
#
#echo -e ${BGREEN}${D2}/${F} "                     " ${D1}/${F}${NC}
#echo ""
#diff -r -Bw --side-by-side $D2/$F $D1/$F
#
#) | less -R


TARGET="${F}|"
(

echo  "DIFF "  "${D2}/${F} "    ${D1}/${F}

diff -r -Bw --side-by-side $D2/$F $D1/$F

) | expand -t 8 | awk -v TARGET=$TARGET '

function basename(file) {
    sub(".*/", "", file)
    return file
}

BEGIN { PSEQ = 0 }
{
   if( $1 == "diff" ) {
     print ""
     print "\033[1;32m"  $5 "               " $6  "\033[0m"
     print ""
     TARGET = basename($5)"|"

   } else if( $1 == "DIFF" ) {
     print $0 
     print ""
   } else {

        F = substr($0,63,1);
        if( F == ">" ){
          print TARGET "\033[1;33m"  $0    "\033[0m"
        } else if ( F == "<" ) {
          print TARGET "\033[1;34m"  $0    "\033[0m"
        } else if ( F == "|" ) {
          print TARGET "\033[1;36m"  $0    "\033[0m"
        } else {
          print TARGET $0
        }
   }
}
'  | less -R


