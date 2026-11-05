package chat_service.ws.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatEvent<T> {

    private String event;
    private Long conversationId;
    private String timestamp;
    private T data;

    public static <T> ChatEvent<T> of(String event, Long conversationId, T data) {
        return ChatEvent.<T>builder()
                .event(event)
                .conversationId(conversationId)
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .data(data)
                .build();
    }
}

