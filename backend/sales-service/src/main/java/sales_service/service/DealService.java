package sales_service.service;

import sales_service.dto.request.DealRequest;
import sales_service.model.Deal;
import sales_service.repository.DealRepository;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class DealService {
    private final DealRepository dealRepository;
    public DealService(DealRepository dealRepository) {
        this.dealRepository = dealRepository;
    }

    public Deal getDealByIdAndSalesId(Long id, Long salesId){
        return dealRepository.findByIdAndSalesId(id, salesId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Deal not found"
                ));
    }

    public List<Deal> getDealsBySalesId(Long salesId){
        return dealRepository.findBySalesId(salesId);
    }

    public Deal createDeal(DealRequest request, Long salesId){
        Deal deal = new Deal();
        deal.setOwner(request.getOwner());
        deal.setAmount(request.getAmount());
        deal.setStage(request.getStage());
        deal.setSalesId(salesId);

        return dealRepository.save(deal);
    }

    public void deleteDeal(Long id, Long salesId){
        Deal d = dealRepository.findByIdAndSalesId(id, salesId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Deal not found"
                ));
        dealRepository.delete(d);
    }

    public Deal updateDeal(Long id, DealRequest request, Long salesId){
        Deal deal = dealRepository.findByIdAndSalesId(id, salesId)
                .orElseThrow(() -> new NoSuchElementException("Deal not found."));

        if (request.getOwner() == null ||
                request.getAmount() == null ||
                request.getStage() == null) {

            throw new IllegalArgumentException("All deal fields are required");
        }
        deal.setOwner(request.getOwner());
        deal.setAmount(request.getAmount());
        deal.setStage(request.getStage());

        return dealRepository.save(deal);

    }

    public Deal patchDeal(Long id, DealRequest request, Long salesId){
        Deal deal = dealRepository.findByIdAndSalesId(id, salesId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Deal not found"
                ));

        if(request.getOwner() != null){
            deal.setOwner(request.getOwner());
        }

        if(request.getAmount() != null){
            deal.setAmount(request.getAmount());
        }

        if(request.getStage()!= null){
            deal.setStage(request.getStage());
        }

        return dealRepository.save(deal);
    }

}
