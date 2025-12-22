package com.crms.app.support;

import com.crms.app.config.TestMailConfig;
import com.crms.app.model.AdditionalService;
import com.crms.app.model.Car;
import com.crms.app.model.CarStatus;
import com.crms.app.model.Equipment;
import com.crms.app.model.Location;
import com.crms.app.model.Member;
import com.crms.app.model.User;
import com.crms.app.model.UserRole;
import com.crms.app.repository.CarRepository;
import com.crms.app.repository.EquipmentRepository;
import com.crms.app.repository.LocationRepository;
import com.crms.app.repository.MemberRepository;
import com.crms.app.repository.ReservationRepository;
import com.crms.app.repository.ServiceRepository;
import com.crms.app.repository.UserRepository;
import java.math.BigDecimal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@Import(TestMailConfig.class)
public abstract class IntegrationTestSupport {

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected MemberRepository memberRepository;

    @Autowired
    protected LocationRepository locationRepository;

    @Autowired
    protected CarRepository carRepository;

    @Autowired
    protected ReservationRepository reservationRepository;

    @Autowired
    protected ServiceRepository serviceRepository;

    @Autowired
    protected EquipmentRepository equipmentRepository;

    @Autowired
    protected PasswordEncoder passwordEncoder;

    protected Location createLocation(String code) {
        Location location = new Location();
        location.setCode(code);
        location.setName("Location " + code);
        location.setAddress("Address " + code);
        return locationRepository.save(location);
    }

    protected Member createMember(String email, String rawPassword) {
        Member member = new Member();
        member.setEmail(email);
        member.setPassword(passwordEncoder.encode(rawPassword));
        member.setFullName("Test Member");
        member.setPhone("+901111111111");
        member.setAddress("Test Address");
        member.setDrivingLicenseNumber("DL12345");
        member.setRole(UserRole.MEMBER);
        return memberRepository.save(member);
    }

    protected User createAdmin(String email, String rawPassword) {
        User admin = new User();
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(rawPassword));
        admin.setFullName("Admin User");
        admin.setRole(UserRole.ADMIN);
        return userRepository.save(admin);
    }

    protected Car createCar(Location location, String barcode, String licensePlate) {
        Car car = new Car();
        car.setMake("Toyota");
        car.setModel("Corolla");
        car.setModelYear(2022);
        car.setBarcode(barcode);
        car.setLicensePlate(licensePlate);
        car.setCarType("Sedan");
        car.setMileage(10000);
        car.setSeats(5);
        car.setDailyRate(BigDecimal.valueOf(100));
        car.setTransmission("Automatic");
        car.setFuelType("Gasoline");
        car.setGpsIncluded(true);
        car.setChildSeat(false);
        car.setAirConditioning(true);
        car.setStatus(CarStatus.AVAILABLE);
        car.setDescription("Test car");
        car.setLocation(location);
        return carRepository.save(car);
    }

    protected AdditionalService createService(String name, BigDecimal price) {
        AdditionalService service = new AdditionalService();
        service.setName(name);
        service.setDailyPrice(price);
        return serviceRepository.save(service);
    }

    protected Equipment createEquipment(String name, BigDecimal price) {
        Equipment equipment = new Equipment();
        equipment.setName(name);
        equipment.setDailyPrice(price);
        return equipmentRepository.save(equipment);
    }
}
