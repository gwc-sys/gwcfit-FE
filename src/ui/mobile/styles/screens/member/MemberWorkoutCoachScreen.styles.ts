import { controlMetrics } from "../../../theme/theme";
import { adaptPageStyles } from "../../adaptPageStyles";
import { StyleSheet } from "react-native";

export const s = adaptPageStyles(StyleSheet.create({
  screen:{gap:18,padding:18,paddingBottom:38,backgroundColor:"#000000"},center:{flex:1,alignItems:"center",justifyContent:"center",gap:12,backgroundColor:"#000000"},topbar:{flexDirection:"row",alignItems:"center",flexWrap:"wrap",gap:14},topButton:{ height: undefined, minWidth:104, flexDirection:"row", alignItems:"center", justifyContent:"center", gap:9, borderWidth:1, borderColor:"#007AFF", borderRadius:12, paddingHorizontal:16, backgroundColor:"#1C1C1E", minHeight: 50 },heading:{flex:1,minWidth:250},eyebrow:{
      color:"#E91E63",
      fontSize:11,
      fontWeight: "700",
      letterSpacing:1.1
    },title:{
      color:"#FFFFFF",
      fontSize:22,
      lineHeight:29,
      fontWeight: "700"
    },muted:{color:"#007AFF",fontSize:12},buttonText:{
      color:"#FFFFFF",
      fontSize:12,
      fontWeight: "700"
    },timer:{height:50,minWidth:118,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:9,borderWidth:1,borderColor:"#007AFF",borderRadius:12,backgroundColor:"#1C1C1E"},timerText:{
      color:"#FFFFFF",
      fontSize:18,
      fontWeight: "700",
      fontVariant:["tabular-nums"]
    },
  layout:{flexDirection:"row",alignItems:"flex-start",gap:18},stacked:{flexDirection:"column"},main:{flex:1,minWidth:0,gap:18},rail:{width:365,gap:16},railStack:{width:"100%",flexDirection:"row",flexWrap:"wrap"},analysisCard:{gap:13,borderWidth:1,borderColor:"#007AFF",borderRadius:15,padding:9,backgroundColor:"#1C1C1E"},cardHead:{minHeight:38,flexDirection:"row",alignItems:"center",gap:12,paddingHorizontal:10},analysisTitle:{
      color:"#E91E63",
      fontSize:13,
      fontWeight: "700"
    },live:{borderWidth:1,borderColor:"rgba(52, 199, 89,.35)",borderRadius:99,paddingHorizontal:11,paddingVertical:4,backgroundColor:"rgba(52, 199, 89,.12)"},liveText:{
      color:"#34C759",
      fontSize:9,
      fontWeight: "700"
    },
  stage:{position:"relative",minHeight:510,overflow:"hidden",borderRadius:13,backgroundColor:"#007AFF"},camera:{width:"100%",height:510},shade:{position:"absolute",top:0,right:0,bottom:0,left:0,backgroundColor:"rgba(0, 0, 0,.15)"},skeleton:{position:"absolute",top:0,right:0,bottom:0,left:0,pointerEvents:"none"},reps:{position:"absolute",left:12,top:12,width:128,borderWidth:1,borderColor:"#007AFF",borderRadius:11,padding:14,backgroundColor:"rgba(0, 0, 0,.9)"},rom:{position:"absolute",right:12,top:12,width:126,alignItems:"center",borderWidth:1,borderColor:"#007AFF",borderRadius:11,padding:12,backgroundColor:"rgba(0, 0, 0,.9)"},smallLabel:{color:"#007AFF",fontSize:10,fontWeight:"800"},bigValue:{
      color:"#FFFFFF",
      fontSize:27,
      fontWeight: "700"
    },target:{color:"#007AFF",fontSize:21},good:{
      color:"#34C759",
      fontSize:10,
      fontWeight: "700"
    },angleList:{position:"absolute",right:12,top:126,width:130,gap:5},angle:{borderWidth:1,borderColor:"#007AFF",borderRadius:9,paddingHorizontal:11,paddingVertical:8,backgroundColor:"rgba(0, 0, 0,.9)"},angleLabel:{color:"#FFFFFF",fontSize:10},angleLine:{flexDirection:"row",alignItems:"center",justifyContent:"space-between"},angleValue:{
      color:"#FFFFFF",
      fontSize:17,
      fontWeight: "700"
    },angleStatus:{color:"#34C759",fontSize:9,fontWeight:"800"},warning:{color:"#E91E63"},
  feedback:{position:"absolute",left:12,bottom:12,maxWidth:290,minHeight:78,flexDirection:"row",gap:10,borderWidth:1,borderColor:"#007AFF",borderRadius:10,padding:13,backgroundColor:"rgba(0, 0, 0,.9)"},feedbackTitle:{
      color:"#34C759",
      fontSize:13,
      fontWeight: "700"
    },feedbackText:{maxWidth:235,color:"#FFFFFF",fontSize:11,lineHeight:17},startCamera:{position:"absolute",left:"50%",top:"50%",minHeight:48,flexDirection:"row",alignItems:"center",gap:9,borderRadius:24,paddingHorizontal:19,transform:[{translateX:-90},{translateY:-24}],backgroundColor:"#E91E63"},controls:{position:"absolute",left:"50%",bottom:17,flexDirection:"row",alignItems:"center",gap:20,borderRadius:36,paddingHorizontal:18,paddingVertical:8,transform:[{translateX:-108}],backgroundColor:"rgba(0, 0, 0,.84)"},round:{ width: controlMetrics.minimumTouchSize, height: controlMetrics.minimumTouchSize, alignItems:"center", justifyContent:"center", borderRadius:23 },record:{width:53,height:53,alignItems:"center",justifyContent:"center",borderRadius:27,backgroundColor:"#E91E63"},switch:{ position:"absolute", right:12, bottom:12, minHeight: controlMetrics.minimumTouchSize, flexDirection:"row", alignItems:"center", gap:8, borderWidth:1, borderColor:"#F2F2F7", borderRadius:10, paddingHorizontal:14, backgroundColor:"rgba(0, 0, 0,.86)" },
  overlay:{position:"absolute",top:0,right:0,bottom:0,left:0,zIndex:20,alignItems:"center",justifyContent:"center",gap:9,backgroundColor:"rgba(0, 0, 0,.91)"},overlayTitle:{
      color:"#FFFFFF",
      fontSize:21,
      fontWeight: "700"
    },restLabel:{
      color:"#E91E63",
      fontSize:11,
      fontWeight: "700",
      letterSpacing:2
    },restTime:{
      color:"#FFFFFF",
      fontSize:58,
      fontWeight: "700"
    },phases:{minHeight:76,flexDirection:"row",alignItems:"center",borderWidth:1,borderColor:"#007AFF",borderRadius:12,padding:10,backgroundColor:"#1C1C1E"},phase:{flex:1,flexDirection:"row",alignItems:"center",gap:9},phaseNumber:{width:32,height:32,alignItems:"center",justifyContent:"center",borderRadius:16,backgroundColor:"#1C1C1E"},phaseActive:{backgroundColor:"#E91E63"},phaseNumberText:{
      color:"#FFFFFF",
      fontSize:11,
      fontWeight: "700"
    },phaseLabel:{color:"#FFFFFF",fontSize:11,fontWeight:"800"},phaseStatus:{color:"#F2F2F7",fontSize:10},arrow:{marginLeft:"auto",marginRight:7},setRow:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:12,paddingHorizontal:8,paddingBottom:7},exerciseName:{
      color:"#FFFFFF",
      fontSize:14,
      fontWeight: "700"
    },exerciseMeta:{color:"#F2F2F7",fontSize:10},complete:{ minHeight: controlMetrics.minimumTouchSize, flexDirection:"row", alignItems:"center", justifyContent:"center", gap:8, borderRadius:9, paddingHorizontal:17, backgroundColor:"#E91E63" },disabled:{opacity:.35},
  metrics:{flexDirection:"row",flexWrap:"wrap",gap:12},metric:{minHeight:164,flex:1,minWidth:135,alignItems:"center",justifyContent:"center",gap:9,borderWidth:1,borderColor:"#007AFF",borderRadius:13,padding:13,backgroundColor:"#000000"},metricLabel:{color:"#FFFFFF",fontSize:13,fontWeight:"800"},ring:{width:92,height:92,alignItems:"center",justifyContent:"center",borderWidth:7,borderColor:"#34C759",borderRadius:46},metricValue:{
      color:"#FFFFFF",
      fontSize:29,
      fontWeight: "700"
    },metricSub:{
      color:"#34C759",
      fontSize:10,
      fontWeight: "700"
    },warningValue:{color:"#E91E63"},sideCard:{flexGrow:1,gap:12,borderWidth:1,borderColor:"#007AFF",borderRadius:14,padding:17,backgroundColor:"#000000"},sideHead:{flexDirection:"row",alignItems:"center",justifyContent:"space-between"},sideTitle:{
      color:"#FFFFFF",
      fontSize:15,
      fontWeight: "700"
    },queueProgress:{
      color:"#E91E63",
      fontSize:10,
      fontWeight: "700"
    },queue:{gap:5},queueItem:{minHeight:59,flexDirection:"row",alignItems:"center",gap:9,borderRadius:10,paddingHorizontal:8},queueActive:{backgroundColor:"#E91E63"},queueNumber:{width:29,height:29,alignItems:"center",justifyContent:"center",borderRadius:15,backgroundColor:"#007AFF"},queueNumberText:{
      color:"#FFFFFF",
      fontSize:11,
      fontWeight: "700"
    },queueImage:{width:48,height:43},queueCopy:{flex:1,minWidth:0},queueName:{color:"#FFFFFF",fontSize:12,fontWeight:"700"},queueMeta:{color:"#007AFF",fontSize:10},play:{width:32,height:32,alignItems:"center",justifyContent:"center",borderRadius:16,backgroundColor:"#E91E63"},viewAll:{minHeight:38,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:8},listRow:{flexDirection:"row",alignItems:"flex-start",gap:9},listText:{flex:1,color:"#007AFF",fontSize:11,lineHeight:17},error:{color:"#E91E63",fontSize:12,textAlign:"center"}
}));
