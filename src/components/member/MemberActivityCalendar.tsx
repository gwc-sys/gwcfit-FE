import { useAppTheme } from '../../theme/AppThemeProvider';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import type { MemberActivityDay } from '../../types/member';

const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
type Props = {
  selected: string; days: MemberActivityDay[]; today?: MemberActivityDay;
  onSelect: (date: string) => void; onClose: () => void;
  loadEarlier: () => void; hasEarlier: boolean; loading: boolean; error: boolean; retry: () => void;
};
export function MemberActivityCalendar(p: Props) {
  const {colors,isDark}=useAppTheme();
  const s=createStyles(colors,isDark);
  const { width } = useWindowDimensions();
  const [month, setMonth] = useState(() => { const d = new Date(`${p.selected}T12:00:00`); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const first = key(month);
  const earliest = p.days.reduce((min, d) => d.activity_date < min ? d.activity_date : min, key(new Date()));
  useEffect(() => {
    if (p.hasEarlier && !p.loading && !p.error && earliest > first) p.loadEarlier();
  }, [first, earliest, p.hasEarlier, p.loading, p.error, p.loadEarlier]);
  const records = new Map(p.days.map(d => [d.activity_date, d]));
  if (p.today) records.set(p.today.activity_date, p.today);
  const size = Math.min((Math.min(width,650)-32)/7-10, 46);
  const stroke = size*.2, r = (size-stroke)/2, c = 2*Math.PI*r;
  const move = (n: number) => setMonth(new Date(month.getFullYear(), month.getMonth()+n, 1));
  const months = [month, new Date(month.getFullYear(), month.getMonth()+1, 1)];
  return <View style={s.sheet}>
    <View style={s.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Previous month" onPress={() => move(-1)} style={s.nav}><Ionicons name="chevron-back" size={20} color={colors.textMuted} /></Pressable>
      <Text accessibilityRole="header" style={s.title}>{month.toLocaleDateString('en-GB',{month:'long',year:'numeric'})}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Next month" onPress={() => move(1)} style={s.nav}><Ionicons name="chevron-forward" size={20} color={colors.textMuted} /></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Close calendar" onPress={p.onClose} style={s.close}><Ionicons name="close" size={30} color={colors.text} /></Pressable>
    </View>
    <View style={s.week}>{['M','T','W','T','F','S','S'].map((d,i) => <Text key={i} style={s.weekday}>{d}</Text>)}</View>
    <ScrollView key={first} contentContainerStyle={s.months}>
      {p.loading && <Text style={s.hint}>Loading activity…</Text>}
      {p.error && <Pressable onPress={p.retry}><Text style={s.hint}>Could not load activity. Tap to retry.</Text></Pressable>}
      {months.map(m => {
        const offset=(m.getDay()+6)%7, count=new Date(m.getFullYear(),m.getMonth()+1,0).getDate();
        return <View key={key(m)}>
          <View style={s.monthHeading}>{Array.from({length:offset},(_,i)=><View key={i} style={s.spacer}/>)}<Text style={s.monthName}>{m.toLocaleDateString('en-GB',{month:'short'})}</Text></View>
          <View style={s.grid}>
            {Array.from({length:offset},(_,i)=><View key={`blank-${i}`} style={s.spacer}/>)}
            {Array.from({length:count},(_,i) => {
              const date=key(new Date(m.getFullYear(),m.getMonth(),i+1)), item=records.get(date);
              const progress=item?.calories_target ? Math.min(1,item.calories_completed/item.calories_target) : 0;
              return <Pressable key={date} accessibilityRole="button" accessibilityLabel={`${date}, ${item ? `${item.calories_completed} of ${item.calories_target} kcal` : 'no activity recorded'}`} accessibilityState={{selected:date===p.selected}} onPress={()=>p.onSelect(date)} style={s.cell}>
                <Text style={[s.day,date===p.selected&&s.selected,date===key(new Date())&&s.today]}>{i+1}</Text>
                <Svg width={size} height={size}><Circle cx={size/2} cy={size/2} r={r} fill="none" stroke={colors.border} strokeWidth={stroke}/><Circle cx={size/2} cy={size/2} r={r} fill="none" stroke={colors.text} strokeWidth={stroke} strokeDasharray={`${c} ${c}`} strokeDashoffset={c*(1-progress)} rotation={-90} origin={`${size/2}, ${size/2}`} strokeLinecap="round" opacity={progress>0?1:0}/></Svg>
              </Pressable>;
            })}
          </View>
        </View>;
      })}
    </ScrollView>
  </View>;
}
const createStyles=(colors:ReturnType<typeof useAppTheme>['colors'],isDark:boolean)=>StyleSheet.create({
  sheet:{flex:1,backgroundColor:colors.surface,borderTopLeftRadius:34,borderTopRightRadius:34,paddingTop:16,width:'100%',maxWidth:650,alignSelf:'center',overflow:'hidden'},
  header:{flexDirection:'row',alignItems:'center',paddingHorizontal:12,paddingBottom:18,gap:3},title:{flex:1,color:colors.text,fontSize:21,fontWeight:'700',textAlign:'center'},nav:{minWidth:44,minHeight:44,alignItems:'center',justifyContent:'center'},close:{width:46,height:46,borderRadius:23,borderWidth:1,borderColor:colors.border,alignItems:'center',justifyContent:'center',marginLeft:4},
  week:{flexDirection:'row',paddingHorizontal:16,paddingBottom:6},weekday:{width:'14.285714%',textAlign:'center',color:colors.textMuted,fontSize:14},months:{paddingHorizontal:16,paddingBottom:32,gap:32},grid:{flexDirection:'row',flexWrap:'wrap'},spacer:{width:'14.285714%'},cell:{width:'14.285714%',alignItems:'center',gap:5,paddingBottom:14,minHeight:84},monthHeading:{flexDirection:'row',height:32},monthName:{width:'14.285714%',textAlign:'center',color:colors.text,fontSize:23,fontWeight:'600'},day:{color:colors.text,fontSize:20,lineHeight:28,minWidth:28,textAlign:'center',borderRadius:14,overflow:'hidden'},today:{backgroundColor:colors.primary,color:colors.textOnPrimary},selected:{backgroundColor:colors.border},hint:{color:colors.textMuted,fontSize:12,paddingVertical:8}
});
