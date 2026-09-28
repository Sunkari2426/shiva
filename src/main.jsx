import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {LayoutDashboard,Recycle,Truck,Users,MapPin,IndianRupee,ClipboardList,Bell,Settings,Menu,ArrowRight,CheckCircle2,Clock3,PackageCheck} from 'lucide-react';
import './styles.css';

const scrapRates=[['Newspaper','₹18/kg','Paper'],['Cardboard','₹12/kg','Paper'],['Iron / Steel','₹32/kg','Metal'],['Aluminium','₹145/kg','Metal'],['Plastic','₹22/kg','Plastic'],['E-waste','₹45/kg','Special']];

const demoPickups=[
 {id:'SM-1042',customer:'Ravi Kumar',area:'MVP Colony',date:'Today · 10:30 AM',items:'Newspaper, Cardboard',amount:'₹540',status:'EN_ROUTE'},
 {id:'SM-1041',customer:'Anitha Rao',area:'Seethammadhara',date:'Today · 12:00 PM',items:'Iron, Aluminium',amount:'₹1,860',status:'ACCEPTED'},
 {id:'SM-1038',customer:'Kiran Home',area:'Gajuwaka',date:'Tomorrow · 09:00 AM',items:'Plastic',amount:'₹420',status:'PENDING'}
];

function App(){
 const [role,setRole]=useState('customer');
 const [tab,setTab]=useState('home');
 const [mobile,setMobile]=useState(false);
 const nav= role==='customer'
 ? [['home','Home',LayoutDashboard],['book','Book Pickup',Recycle],['history','History',ClipboardList],['profile','Profile',Users]]
 : role==='partner'
 ? [['dashboard','Dashboard',LayoutDashboard],['requests','Requests',PackageCheck],['schedule','Schedule',Clock3],['earnings','Earnings',IndianRupee]]
 : [['dashboard','Dashboard',LayoutDashboard],['pickups','Pickups',Truck],['users','Users',Users],['rates','Rates',IndianRupee],['reports','Reports',ClipboardList],['settings','Settings',Settings]];

 return <div className="app">
  <aside className={mobile?'sidebar open':'sidebar'}>
   <div className="brand"><div className="brandMark">♻</div><div><strong>Scrap Mama</strong><span>{role==='customer'?'Customer':role==='partner'?'Partner':'Management'}</span></div></div>
   <div className="roleSwitch">
    {['customer','partner','admin'].map(r=><button key={r} className={role===r?'active':''} onClick={()=>{setRole(r);setTab(r==='customer'?'home':'dashboard')}}>{r}</button>)}
   </div>
   <nav>{nav.map(([id,label,Icon])=><button key={id} className={tab===id?'nav active':'nav'} onClick={()=>{setTab(id);setMobile(false)}}><Icon size={18}/>{label}</button>)}</nav>
   <div className="sideNote"><Recycle size={20}/><div><b>Recycle better</b><small>Doorstep pickup made simple.</small></div></div>
  </aside>
  <main className="main">
   <header><button className="menu" onClick={()=>setMobile(!mobile)}><Menu/></button><div><small>SCRAP PICKUP PLATFORM</small><h1>{title(role,tab)}</h1></div><button className="iconBtn"><Bell size={19}/><i/></button></header>
   <section className="content">{render(role,tab)}</section>
  </main>
 </div>
}

function title(role,tab){const map={home:'Good evening 👋',book:'Book a pickup',history:'Pickup history',profile:'My profile',dashboard:role==='partner'?'Partner dashboard':'Management dashboard',requests:'Pickup requests',schedule:'Pickup schedule',earnings:'Earnings',pickups:'Pickup management',users:'Users & partners',rates:'Scrap rates',reports:'Reports & analytics',settings:'Settings'};return map[tab]||'Scrap Mama'}

function render(role,tab){
 if(role==='customer') return tab==='home'?<CustomerHome/>:tab==='book'?<BookPickup/>:tab==='history'?<History/>:<Profile/>;
 if(role==='partner') return tab==='dashboard'?<PartnerDash/>:tab==='requests'?<Requests/>:tab==='schedule'?<Schedule/>:<Earnings/>;
 return <Admin tab={tab}/>;
}

function CustomerHome(){return <><div className="hero"><div><span className="eyebrow">DOORSTEP SCRAP COLLECTION</span><h2>Turn your scrap into value.</h2><p>Choose your scrap, schedule a pickup and we’ll handle the rest.</p><button className="primary">Book pickup <ArrowRight size={17}/></button></div><div className="heroArt">♻</div></div><div className="sectionHead"><h3>Today’s rates</h3><span>Updated by admin</span></div><div className="rateGrid">{scrapRates.map(x=><div className="rate" key={x[0]}><div><b>{x[0]}</b><small>{x[2]}</small></div><strong>{x[1]}</strong></div>)}</div><div className="sectionHead"><h3>Upcoming pickup</h3></div><div className="pickupCard"><div className="statusDot enroute"/> <div><b>SM-1042 · Collector is on the way</b><p>Today · 10:30 AM · MVP Colony</p></div><button className="outline">Track</button></div></>}

function BookPickup(){return <div className="two"><div className="panel"><div className="panelHead"><div><h3>Pickup details</h3><p>Select what you want us to collect.</p></div><span className="step">1 / 3</span></div><label>Scrap categories</label><div className="chips">{scrapRates.map(x=><button className="chip" key={x[0]}>{x[0]}</button>)}</div><label>Estimated quantity</label><div className="inputRow"><input placeholder="e.g. 15"/><span>kg</span></div><label>Pickup address</label><select><option>Home · MVP Colony, Visakhapatnam</option><option>+ Add new address</option></select><div className="row"><div><label>Date</label><input type="date"/></div><div><label>Time slot</label><select><option>10:00 AM – 12:00 PM</option><option>2:00 PM – 4:00 PM</option></select></div></div><button className="primary wide">Confirm pickup <ArrowRight size={17}/></button></div><div className="panel summary"><h3>Estimated value</h3><div className="estimate">₹540</div><p>Final amount is calculated using the actual weight recorded by the partner.</p><div className="rule"/><b>What happens next?</b><ul><li>We assign an eligible partner</li><li>Partner arrives at your address</li><li>Scrap is weighed</li><li>Final amount is confirmed</li></ul></div></div>}

function History(){return <div className="panel"><div className="panelHead"><div><h3>Pickup history</h3><p>Your completed and cancelled pickups.</p></div><button className="outline">Filter</button></div>{demoPickups.map(p=><div className="listRow" key={p.id}><div className="avatar">♻</div><div><b>{p.id} · {p.items}</b><small>{p.date} · {p.area}</small></div><strong>{p.amount}</strong><span className="pill done">Completed</span></div>)}</div>}

function Profile(){return <div className="two"><div className="panel profile"><div className="avatar big">RK</div><h3>Ravi Kumar</h3><p>+91 9XXXX XXXXX</p><button className="outline">Edit profile</button></div><div className="panel"><h3>Saved addresses</h3><div className="address"><MapPin size={18}/><div><b>Home</b><p>MVP Colony, Visakhapatnam</p></div></div><button className="secondary">+ Add address</button></div></div>}

function PartnerDash(){return <><div className="stats"><Stat label="Today's pickups" value="8" icon={PackageCheck}/><Stat label="Completed" value="5" icon={CheckCircle2}/><Stat label="Pending" value="3" icon={Clock3}/><Stat label="Today's earnings" value="₹2,840" icon={IndianRupee}/></div><div className="panel"><div className="panelHead"><div><h3>Active pickup</h3><p>SM-1042 · Ravi Kumar · MVP Colony</p></div><span className="pill blue">EN_ROUTE</span></div><div className="mapMock"><MapPin size={28}/><span>Navigation / live route</span></div><div className="actionRow"><button className="outline">Open navigation</button><button className="primary">Mark arrived</button></div></div></>}

function Requests(){return <div className="panel"><div className="panelHead"><div><h3>New pickup requests</h3><p>Nearby jobs available for acceptance.</p></div><span className="pill">3 new</span></div>{demoPickups.map(p=><div className="request" key={p.id}><div><b>{p.id}</b><h4>{p.customer}</h4><p>{p.area} · {p.items}</p><small>{p.date}</small></div><div className="actions"><b>{p.amount}</b><button className="primary">Accept</button><button className="outline">Reject</button></div></div>)}</div>}

function Schedule(){return <div className="panel"><h3>Today's schedule</h3>{demoPickups.map((p,i)=><div className="timeline" key={p.id}><div className="time">{i===0?'10:30':'12:00'}</div><div className="line"/><div><b>{p.customer}</b><p>{p.area} · {p.items}</p><span className="pill blue">{p.status}</span></div></div>)}</div>}
function Earnings(){return <div className="two"><div className="panel"><h3>This week</h3><div className="estimate">₹14,280</div><p>38 completed pickups</p><div className="bars">{[45,70,55,85,65,90,75].map((h,i)=><i key={i} style={{height:h+'%'}}/>)}</div></div><div className="panel"><h3>Recent earnings</h3>{['SM-1042 · ₹540','SM-1039 · ₹720','SM-1037 · ₹380'].map(x=><div className="listRow" key={x}><div><b>{x}</b><small>Completed · Today</small></div><span className="pill done">Paid</span></div>)}</div></div>}

function Admin({tab}){if(tab==='rates')return <Rates/>;if(tab==='users')return <UsersPage/>;if(tab==='reports')return <Reports/>;if(tab==='settings')return <SettingsPage/>;return <><div className="stats"><Stat label="Customers" value="1,248" icon={Users}/><Stat label="Partners" value="86" icon={Truck}/><Stat label="Today's pickups" value="142" icon={PackageCheck}/><Stat label="Today's revenue" value="₹68.4K" icon={IndianRupee}/></div><div className="two"><div className="panel"><div className="panelHead"><div><h3>Pickup operations</h3><p>Live operational status</p></div><button className="outline">View all</button></div>{[['Pending','18'],['Assigned','12'],['En route','9'],['Arrived','7'],['Completed','96']].map(x=><div className="progressRow" key={x[0]}><span>{x[0]}</span><div><i style={{width:(+x[1]/142*100)+'%'}}/></div><b>{x[1]}</b></div>)}</div><div className="panel"><h3>Operational alerts</h3><div className="alert"><span>!</span><div><b>4 pickups need assignment</b><p>Service area: MVP Colony</p></div></div><div className="alert"><span>₹</span><div><b>3 payment records pending</b><p>Review before day close</p></div></div></div></div><div className="panel"><div className="panelHead"><div><h3>Recent pickups</h3><p>Latest platform activity</p></div><button className="outline">Export</button></div><Table/></div></>}
function Table(){return <div className="table">{demoPickups.map(p=><div className="tr" key={p.id}><b>{p.id}</b><span>{p.customer}</span><span>{p.area}</span><span>{p.items}</span><span className="pill blue">{p.status}</span><strong>{p.amount}</strong></div>)}</div>}
function Rates(){return <div className="panel"><div className="panelHead"><div><h3>Scrap rates</h3><p>Only administrators can change official rates.</p></div><button className="primary">+ Add category</button></div>{scrapRates.map(x=><div className="rate adminRate" key={x[0]}><div><b>{x[0]}</b><small>{x[2]} · Active</small></div><strong>{x[1]}</strong><button className="outline">Edit</button></div>)}</div>}
function UsersPage(){return <div className="panel"><div className="panelHead"><div><h3>Users & partners</h3><p>Manage platform accounts and partner eligibility.</p></div><button className="outline">Search</button></div>{['Ravi Kumar · Customer','Anitha Rao · Customer','Suresh Recycling · Partner','Prasad Scrap Services · Partner'].map(x=><div className="listRow" key={x}><div className="avatar">U</div><div><b>{x}</b><small>Active · Verified</small></div><button className="outline">Manage</button></div>)}</div>}
function Reports(){return <div className="stats"><Stat label="Scrap collected" value="4.82T" icon={Recycle}/><Stat label="Completed pickups" value="2,814" icon={CheckCircle2}/><Stat label="Avg. pickup value" value="₹486" icon={IndianRupee}/><Stat label="Completion rate" value="94.2%" icon={PackageCheck}/></div>}
function SettingsPage(){return <div className="panel"><h3>Platform settings</h3><div className="setting"><div><b>Live location sharing</b><p>Show partner location only during active pickups.</p></div><button className="toggle on"/></div><div className="setting"><div><b>Pickup notifications</b><p>Send status notifications to customers and partners.</p></div><button className="toggle on"/></div><div className="setting"><div><b>UPI payments</b><p>Phase 2 integration placeholder.</p></div><button className="toggle"/></div></div>}
function Stat({label,value,icon:Icon}){return <div className="stat"><div className="statIcon"><Icon size={19}/></div><div><small>{label}</small><strong>{value}</strong></div></div>}

createRoot(document.getElementById('root')).render(<App/>);