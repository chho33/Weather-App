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
} from '@chakra-ui/react';
import { IconButton } from '@chakra-ui/button'
import { SearchIcon } from '@chakra-ui/icons'
import config from "./config.json";


const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const MenuInput = props => {
  const { role, ...rest } = useMenuItem(props);
  return (
    <Input role={role} placeholder="Enter City" w="200px" {...rest} />
  )
}

const App = () => {

  const [currentTime, setCurrentTime] = useState(new Date())
  const [temp, setTemp] = useState({
    city: "New York",
    country: "US",
    descrip: "clear",
    temp: 47,
    feel: 3,
    wind: 9,
    humid: 38,
    icon: "http://openweathermap.org/img/wn/10d@2x.png"
  })
  const [tempDaily, setTempDaily] = useState([])
  //const [tmpHours, setTempHours] = useState([])
  const cityOptionDefalt = {name: "No Valid City", isDisabled: true, lat: null, lon: null, city: null, country: null}
  const [cityOptions, setCityOptions] = useState([cityOptionDefalt])

  const cityRef = useRef(null)

  useEffect(() => {
    fetch(`${config.protocol}://${config.host}:${config.port}/get_weather`)
    .then(response => response.json())
    .then(response => {
      setTemp(response.current)
      setTempDaily([])
      setTempDaily(response.daily)
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
      setTempDaily([])
      setTempDaily(response.daily)
      setCurrentTime(new Date())
      setCityOptions([cityOptionDefalt])
    })
  }


  return (
    <ChakraProvider theme={theme}>
      <Center>
      <Box textAlign="center" fontSize="2xl" boxSize="2xl" bg='gray.100'>
        <Flex align="left" justify="left" p='5'>
          <Box w='250px' p='1.5' bg='red.400'>
            <Text align="left" justify="left" >{temp.city}, {temp.country}</Text>
          </Box>
          <Box w='250px' ml='10' p='1' bg='green.400' fontSize="lg">
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
        <Flex align="left" justify="left" pl='5' pr='5' pt='5' h='120px'>
          <Box w='110px' p='1' bg='red.400'>
            <Image src={temp.icon} alt='Weather Icon' />
          </Box>
          <Box w='180px' p='1.5' bg='red.400' align="left">
            <Text fontSize="6xl">{Number(temp.temp.toFixed(0))}°F</Text>
          </Box>
          <Box w='10px'>
          </Box> 
          <Box w='180px' bg='green.400'>
            <VStack fontSize="lg" align="left" justify="left" pl='1.5'>
              <Text align="left">Feels Like: {temp.feel}°</Text>
              <Text align="left">Wind: {temp.wind} MPH</Text>
              <Text align="left">Humidity: {temp.humid}%</Text> 
            </VStack>
          </Box>
          <Spacer />
        </Flex>
        <Flex fontSize="xl" align="left" justify="left" h="20px" pl='5' pr='5'>
          <Text>{temp.descrip} {weekday[currentTime.getDay()]} {currentTime.getDate()}, {currentTime.getHours()}:{currentTime.getMinutes()}</Text>
        </Flex>
        <Flex align="left" justify="left" p='5'>
          {tempDaily.map(ele => (
            <Box key={ele.date} bg='green.400' h='155px' p='1' m='0.5' flex='1' align="center">
                <Text fontSize='md'> {ele.date}</Text>
                <Image boxSize='70px' src={ele.icon} alt='Weather Icon' />
                <Text fontSize='md'> {ele.tempMax}</Text>
                <Text fontSize='md'> {ele.tempMin}</Text>
            </Box>
          ))}
        </Flex>
        <Flex align="left" justify="left" pl='5' pr='5' pb='5'>
          
        </Flex>
      </Box>
      </Center>
    </ChakraProvider>
  );
}

export default App;
