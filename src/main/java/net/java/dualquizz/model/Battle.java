package net.java.dualquizz.model;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.MapKeyColumn;
import javax.xml.bind.annotation.XmlRootElement;
import org.hibernate.annotations.GenericGenerator;

/**
 * Represents a battle of multiple player of a DualQuizz game
 * @licence http://www.gnu.org/licenses/agpl-3.0.html
 * @author bugeaud at gmail dot com
 */
@Entity
@XmlRootElement
public class Battle implements Serializable {
    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid2")
    private String id; 
   
    private String category;
    
    @MapKeyColumn(name = "playerId")
    @Column(name= "boardScore")
    @ElementCollection
    //private Map<Player,Integer> board = new HashMap<>();
    private Map<String,Integer> boardMembers = new HashMap<>();

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (id != null ? id.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof Battle)) {
            return false;
        }
        Battle other = (Battle) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "net.java.dualquizz.model.Battle[ id=" + id + " ]";
    }

    /**
     * @return the category
     */
    public String getCategory() {
        return category;
    }

    /**
     * @param category the category to set
     */
    public void setCategory(String category) {
        this.category = category;
    }

    /**
     * @return the board
     */
    public Map<String,Integer> getBoardMembers() {
        return boardMembers;
    }

    /**
     * @param boardMembers the board members to set
     */
    public void setBoardMembers(Map<String,Integer> boardMembers) {
        this.boardMembers = boardMembers;
    }
    
}
