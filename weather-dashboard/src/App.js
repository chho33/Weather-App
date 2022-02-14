import React, { useState, useEffect, useRef } from "react"
import {
  ChakraProvider,
  Box,
  Text,
  theme,
  Flex,
  Spacer,
  Center,
  Image,
  VStack,
  Input,
  Menu,
  MenuList,
  MenuItem,
  MenuButton,
  useMenuItem,
  Spinner,
} from '@chakra-ui/react'
import { IconButton } from '@chakra-ui/button'
import { SearchIcon } from '@chakra-ui/icons'
import { Area } from '@ant-design/plots'
import config from "./config.json"


const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const MenuInput = props => {
  const { role, ...rest } = useMenuItem(props);
  return (
    <Input role={role} placeholder="Enter City" w="200px" {...rest} />
  )
}


const HoursAnnotation = tempHours => {
  let annotations = []

  tempHours.forEach((ele, idx) => {
    if (idx % 2 === 0) {
      annotations.push({
        type: 'text',
        content: `${ele.temp}°`,
        position: (xScale, yScale) => {
          return [
            `${xScale.scale(ele.date) * 100}%`,
            `${(0.95 - yScale.temp.values[idx] / yScale.temp.ticks[yScale.temp.ticks.length-1]) * 100}%`
          ]
        },
        style: {
          textAlign: 'center',
          fill: '#CD8E99',
        },
      })
      annotations.push({
        type: 'text',
        content: `${ele.pop}%`,
        position: (xScale) => {
          return [`${xScale.scale(ele.date) * 100}%`, '95%']
        },
        style: {
          textAlign: 'center',
          fill: '#00AAFF',
        },
      })
    }
  })

  return annotations
}


const App = () => {

  const [currentTime, setCurrentTime] = useState(new Date())
  const [temp, setTemp] = useState()
  const [tempDaily, setTempDaily] = useState()
  const [tempHours, setTempHours] = useState()
  const cityOptionDefalt = {name: "No Valid City", isDisabled: true, lat: null, lon: null, city: null, country: null}
  const [cityOptions, setCityOptions] = useState([cityOptionDefalt])

  const cityRef = useRef(null)

  useEffect(() => {
    fetch(`${config.protocol}://${config.host}:${config.port}/get_weather`)
    .then(response => response.json())
    .then(response => {
      setTemp(response.current)
      setTempDaily(null)
      setTempDaily(response.daily)
      setTempHours(null)
      setTempHours(response.hourly)
      setCurrentTime(new Date())
    })
  }, [])

  const onCityInputChange = (event) => cityRef.current = event.target.value

  const handleCityInput = () => {
    fetch(`${config.protocol}://${config.host}:${config.port}/get_cities/${cityRef.current}`)
    .then(response => response.json())
    .then(response => {
      setCityOptions(response)
    })
  }

  const handleCitySearch = (lat, lon, city, country) => {
    fetch(`${config.protocol}://${config.host}:${config.port}/get_weather?lat=${lat}&lon=${lon}&city=${city}&country=${country}`)
    .then(response => response.json())
    .then(response => {
      setTemp(response.current)
      setTempDaily(null)
      setTempDaily(response.daily)
      setCurrentTime(new Date())
      setCityOptions([cityOptionDefalt])
    })
  }

  
  const hoursConfig = {
    xField: 'date',
    yField: 'temp',
    width: 630,
    height: 155,
    autoFit: true,
    label: false,
    yAxis: {grid: null},
    areaStyle: {fill: '#FFC0CB'},
    color: '#EBACB7'
  }


  return (
    <ChakraProvider theme={theme}>
      <Center>
      <Box textAlign="center" fontSize="3xl" boxSize="1.8xl" borderWidth='1px' borderRadius='lg' mt='5'>
        <Flex align="left" justify="left" p='5'>
          <Box w='250px' p='1.5'>
            {temp? <Text align="left" justify="left" >{temp.city}, {temp.country}</Text>: <Spinner/>}
          </Box>
          <Box w='250px' ml='10' p='1' fontSize="lg">
            <Menu>
              <MenuInput mr="0.5" pb="1" onChange={onCityInputChange} />
              <MenuButton mb="0.5" as={IconButton} icon={<SearchIcon />} onClick={handleCityInput}></MenuButton>
              <MenuList>
                {cityOptions.map(option => (
                  <MenuItem key={option.name} isDisabled={option.isDisabled} onClick={() => handleCitySearch(option.lat, option.lon, option.city, option.country)}>
                    {option.name}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </Box>
          <Spacer />
        </Flex>
        <Flex align="left" justify="left" pl='5' pr='5' pt='5' h='120px' mt='-3'>
          <Box w='110px' p='1' ml='-7'>
            {temp? <Image src={temp.icon} alt='Weather Icon' />: <Spinner align='center'/>}
          </Box>
          <Box w='180px' p='1.5' align="left">
            {temp? <Text fontSize="6xl">{Number(temp.temp.toFixed(0))}°F</Text>: <Spinner align='center'/>}
          </Box>
          <Box w='10px'>
          </Box> 
          <Box w='180px'>
            {temp?
            <VStack fontSize="lg" align="left" justify="left" pl='1.5'>
              <Text align="left">Feels Like: {temp.feel}°</Text>
              <Text align="left">Wind: {temp.wind} MPH</Text>
              <Text align="left">Humidity: {temp.humid}%</Text> 
            </VStack>: <Spinner align='center'/>}
          </Box>
          <Spacer />
        </Flex>
        <Flex fontSize="xl" align="left" justify="left" h="20px" pl='5' pr='5' mt='2'>
          {temp?
          <Text>{temp.descrip} • {weekday[currentTime.getDay()]} {currentTime.getDate()}, {currentTime.getHours()}:{currentTime.getMinutes()}</Text>
          : <Spinner align='center'/>}
        </Flex>
        <Flex align="left" justify="left" p='5' mt='2'>
          {tempDaily? tempDaily.map(ele => (
              <Box key={ele.date} bg='gray.100' h='155px' p='1' m='0.5' flex='1' align="center">
                  <Text fontSize='md'> {ele.date}</Text>
                  <Image boxSize='70px' src={ele.icon} alt='Weather Icon' />
                  <Text fontSize='md'> {ele.tempMax}</Text>
                  <Text fontSize='md'> {ele.tempMin}</Text>
              </Box>
            )) : <Spinner size='xl' align='center'/>}
        </Flex>
        <Flex align="left" justify="left" pl='5' pr='5' pb='5' mt='2'>
          {tempHours? <Area data={tempHours} annotations={HoursAnnotation(tempHours)} {...hoursConfig} />: <Spinner size='xl'/>}
        </Flex>
      </Box>
      </Center>
    </ChakraProvider>
  );
}

export default App;


