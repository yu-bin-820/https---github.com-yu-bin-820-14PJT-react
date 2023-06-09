import * as React from 'react';
import './index.css'
import Map from '@/components/Map';
import MapMarker from '@/components/MapMarker';
import useMap from '@/hooks/useMap';
import { MarkerProps } from '@/typings/db';
import axios from 'axios';
import { Button, Typography } from '@mui/material';

declare global {
  interface Window {
    kakao: any;
  }
}

export default function BranchesAddr() {

  const [state, setState] = React.useState({
    center: {
      lat: 37.5696563183315,
      lng: 126.986756202034,
    }
  })

  React.useEffect(() => {
    if (navigator.geolocation) {
      // GeoLocation을 이용해서 접속 위치를 얻어옵니다
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setState((prev) => ({
            ...prev,
            center: {
              lat: position.coords.latitude, // 위도
              lng: position.coords.longitude, // 경도
            },
            isLoading: false,
          }))
        },
        (err) => {
          console.log("위치정보 가져올 수 없음")
        }
      )
    }
  }, [])

  const [branch, setBranch] = React.useState<any[]>();

  React.useEffect(() => {
    axios
    .get(`http://${import.meta.env.VITE_IP}:8080/branches/json/listBranch`)
      .then((response) => {
        console.log(response.data);
        const data = branchInfo(response.data);
        setBranch(data)
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  function branchInfo(data: any[]){
    const branchData = data.map((item) => 
      ({
        content: <div><Typography variant="h6" gutterBottom>{item.branchName}</Typography>

        <Button variant="outlined" id="{item.branchNo}" >선택</Button></div>,
        latlng: { lat: item.lattude, lng: item.longitude }
      }));

      console.log(branchData);
      return branchData;

  }


  const EventMarkerContainer = ({ latlng , content }: MarkerProps) => {
    const map = useMap()
    const [isVisible, setIsVisible] = React.useState(false)

    return (
      <MapMarker
        position={latlng} // 마커를 표시할 위치
        // @ts-ignore
        onClick={(marker) => map.panTo(marker.getPosition())}
        onMouseOver={() => setIsVisible(true)}
        onMouseOut={() => setIsVisible(false)}
      >
        {isVisible && content}
      </MapMarker>
    )
  }

  return (
    <Map // 지도를 표시할 Container
      center={state.center}
      style={{
        // 지도의 크기
        width: "100%",
        height: "1000px",
      }}
      level={3} // 지도의 확대 레벨
    >
      {branch?.map((value) => (
        <EventMarkerContainer
          key={`EventMarkerContainer-${value.latlng.lat}-${value.latlng.lng}`}
          latlng={value.latlng}
          content={value.content}
        />
      ))}
    </Map>
  )
      }