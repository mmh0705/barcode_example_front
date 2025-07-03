'use client'
import { useState,useEffect,useRef } from "react";
import Image from "next/image";
import styles from "./page.module.css";

type RentalBook = {
	id:number;
	created_at:string;
    book_name:string;
	message:string;
};

export default function Home() {
	const [barcode, setBarcode] = useState('');
	
	const [nameList, setNameList] = useState<string[]>([]);
	const [rentalBookList, setRentalBookList] = useState<RentalBook[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		inputRef.current?.focus(); 
		
		//대여한 책 리스트
		getRentalBookInfoList();

	}, []);

	const getRentalBookInfoList = async() =>{
		try{	
			let response = await fetch('http://localhost:8080/api/barcode/list');
			
			if(!response.ok){
				throw new Error(`Http error!: ${response.status}` )
			}
			
			let data = await response.json();

			setRentalBookList(data);
		}
		catch(error){

		}
		
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			console.log('스캔 완료: ', barcode);
			
			setNameList(prevList => [...prevList, barcode]);
			setBarcode('');
		}
	};


	const sendToServer = async () => {
		//POST
		await fetch('http://localhost:8080/api/barcode/save', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(nameList),
		});
		getRentalBookInfoList();
		setNameList([]);
	};

	const onReturnBook = async(input:number) =>{
		//DELETE
		let response = await fetch('http://localhost:8080/api/barcode/return/single', {
			method:'DELETE',
			headers:{ 'Content-Type': 'application/json' },
			body:JSON.stringify(input)
		});
		let data = await response.json();
		if(data === 1){
			alert('반납완료!');
		}
		else{
			alert("반납실패.")
		}
		getRentalBookInfoList();
	};

	return (
		<div style={{
			display:'flex',
			justifyContent:'center',
			alignItems:'center',
			flexDirection:'row',
			height:'100%',
			marginLeft:'20px',
			marginRight:'20px'
		}}>

			<div style={{
				display:'flex',
				justifyContent:'center',
				alignItems:'center',
				flexDirection:'column',

				// border:'solid 2px black',
				// borderRadius:'10px',
				// width:'750px',
				height:'600px',
				marginRight:'20px'
			}}>
				{/* 바코드 스캔 인풋 */}
				<div style={{
					border:'solid 2px black',
					borderRadius:'10px',
					padding:'10px',
					height:'50px',
					width:'500px',
					marginBottom:'10px'
				}}>
					<input
						ref={inputRef}
						value={barcode}
						onChange={(e) => setBarcode(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="바코드를 스캔하세요"
						style={{
							height:'100%',
							width:'100%'
						}}
					/>
				</div>


				{/* 전송할 바코드 리스트 */}
				<div style={{
					border:'solid 2px black',
					borderRadius:'10px',
					paddingBottom:'10px',
					height:'100%',
					overflow:'hidden',
					width:'500px',
				}}>
					
					<div style={{
						height:'100%',
						margin:'5px',
						overflowY:'auto',
						// boxSizing:'border-box',
						//backgroundColor:'red'
					}}>
						{
							nameList.map((item, index)=>(
								<div key={index}>
									{item}
								</div>
							))
						}
					</div>
					
				</div>


				{/* 전송 버튼 */}
				<button onClick={sendToServer} style={{
					width:'500px',
					height:'30px',
					marginTop:'10px'
				}}>
					전송
				</button>
			</div>
			
			{/* 대여 현황 보드 */}
			<div style={{
				height:'600px',
				overflow:'hidden',
			}}>
				<div style={{height:'30px'}}>대여 현황</div>
				<div style={{
					border:'2px solid black',
					borderRadius:'10px',
					width:'750px',
					height:'calc(100% - 30px)',
					overflow:'hidden',
				}}>
					<div style={{
						overflowY:'auto',
						height:'100%',
						marginLeft:'10px',
					}}>
						{
							rentalBookList.map((item:RentalBook, index) => (
								<div key={index} style={{
									//backgroundColor:'aquamarine',
									marginTop:'10px',
									display:'flex',
									flexDirection:'row'
								}}> 
									<div>책 이름 : {item.book_name}</div>

									
									<div style={{
										marginLeft:'auto', 
										marginRight:'20px',
										display:'flex',
										flexDirection:'row'
									}}>
										<div style={{marginRight:'20px'}}>대여 날짜 : {item.created_at}</div>
										<button onClick={()=>onReturnBook(item.id)}>반납</button>
									</div>

									
								</div>
							))
						}
					</div>
					
				</div>

			</div>
			
		</div>
		
	);
}
