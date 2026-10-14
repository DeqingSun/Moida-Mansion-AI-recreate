#include <algorithm>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <queue>
#include <vector>
using namespace std;
struct Q {int f,g,p;bool operator<(const Q&o)const{return f>o.f || (f==o.f && g<o.g);}};
int main(int argc,char**argv){string dir=argv[1];ifstream in(dir+"/router-input.bin",ios::binary);int w,h,n;in.read((char*)&w,4);in.read((char*)&h,4);in.read((char*)&n,4);int size=w*h;vector<uint8_t> blocked(size),goal(size);in.read((char*)blocked.data(),size);in.read((char*)goal.data(),size);vector<vector<int>> seeds(n);for(auto &v:seeds){int c;in.read((char*)&c,4);v.resize(c);in.read((char*)v.data(),4*c);}vector<int> heuristic(size,-1),queue(size);int a=0,b=0;for(int p=0;p<size;p++)if(goal[p]&&!blocked[p]){heuristic[p]=0;queue[b++]=p;}int offsets[]={1,-1,w,-w};while(a<b){int p=queue[a++];for(int d:offsets){int q=p+d;if(q<0||q>=size||abs(p%w-q%w)>1||blocked[q]||heuristic[q]>=0)continue;heuristic[q]=heuristic[p]+1;queue[b++]=q;}}
vector<int> order(n),difficulty(n);for(int i=0;i<n;i++){order[i]=i;difficulty[i]=100000000;for(int p:seeds[i])if(heuristic[p]>=0)difficulty[i]=min(difficulty[i],heuristic[p]);}cerr<<"Initial unreachable "<<count(difficulty.begin(),difficulty.end(),100000000)<<" / "<<n<<"\n";stable_sort(order.begin(),order.end(),[&](int i,int j){return difficulty[i]>difficulty[j];});vector<int> seen(size,0),cost(size),parent(size);vector<vector<int>> paths(n);int stamp=0,done=0;
for(int i:order){stamp++;priority_queue<Q> pq;for(int p:seeds[i])if(!blocked[p]&&heuristic[p]>=0){seen[p]=stamp;cost[p]=0;parent[p]=-1;pq.push({heuristic[p],0,p});}int end=-1,expanded=0;while(!pq.empty()){Q cur=pq.top();pq.pop();int p=cur.p;if(cost[p]!=cur.g)continue;if(goal[p]){end=p;break;}if(++expanded>2000000)break;for(int d:offsets){int q=p+d;if(q<0||q>=size||abs(p%w-q%w)>1||blocked[q]||heuristic[q]<0)continue;int g=cur.g+1;if(seen[q]==stamp&&cost[q]<=g)continue;seen[q]=stamp;cost[q]=g;parent[q]=p;pq.push({g+heuristic[q],g,q});}}
if(end>=0){for(int p=end;p>=0;p=parent[p])paths[i].push_back(p);reverse(paths[i].begin(),paths[i].end());for(int p:paths[i]){int x=p%w,y=p/w;for(int dy=-2;dy<=2;dy++)for(int dx=-2;dx<=2;dx++){if(dx*dx+dy*dy>=4)continue;int xx=x+dx,yy=y+dy;if(xx>=0&&xx<w&&yy>=0&&yy<h)blocked[yy*w+xx]=1;}} // centre spacing >= 2 units
 // reserve contact pitch near endpoint
 int x=end%w,y=end/w;for(int dy=-4;dy<=4;dy++)for(int dx=-4;dx<=4;dx++){int xx=x+dx,yy=y+dy;if(xx>=0&&xx<w&&yy>=0&&yy<h)blocked[yy*w+xx]=1;}for(int dy=-5;dy<=5;dy++)for(int dx=-5;dx<=5;dx++){int xx=x+dx,yy=y+dy;if(xx>=0&&xx<w&&yy>=0&&yy<h && goal[yy*w+xx])goal[yy*w+xx]=0;}
 done++;}
if(stamp%50==0)cerr<<stamp<<" attempted / "<<done<<" routed\n";
}
ofstream out(dir+"/router-output.bin",ios::binary);for(auto&v:paths){int c=v.size();out.write((char*)&c,4);out.write((char*)v.data(),4*c);}cerr<<"FINAL "<<done<<" / "<<n<<"\n";
}
